using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.DTOs.UserDTOs;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Utilities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace AcessoriosStoreAPI.Services;

public class UserService : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly StoreContext _context;
    private readonly ICapitalize _capitalize;
    private readonly IConfiguration _configuration;

    public UserService(UserManager<User> userManager, IMapper mapper, StoreContext context, ICapitalize capitalize, IConfiguration configuration)
    {
        _userManager = userManager;
        _mapper = mapper;
        _context = context;
        _capitalize = capitalize;
        _configuration = configuration;
    }

    public string CapitalizeFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return fullName;

        string[] lowercaseWords = { "da", "de", "do", "dos", "das" };

        return string.Join(" ", fullName
            .ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select((word, index) =>
            {
                // Always keep the first word capitalized, even being a preposition.
                if (index == 0 || !lowercaseWords.Contains(word))
                    return char.ToUpper(word[0]) + word.Substring(1);
                else
                    return word;
            }));
    }

    public string CapitalizeFirstLetter(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        input = input.ToLower();
        return char.ToUpper(input[0]) + input.Substring(1);
    }

    public bool IsPasswordValid(string password)
    {
        Regex regex = new Regex(@"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*-])[A-Za-z\d!@#$%^&_*-]{8,}$");
        return regex.IsMatch(password);
    }

    public bool IsFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return false;

        string[] separatedName = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return separatedName.Length > 1;
    }

    public bool GenderValidation(string gender)
    {
        string[] validOptions = { "Masculino", "Feminino", "Outros" };
        return validOptions.Contains(gender, StringComparer.OrdinalIgnoreCase);
    }

    // The main role of this function is to allow the DB Manager to update some user role directly in a DB Management.
    // The user's claim will be updated when he/she log in.
    public async Task UpdateAdminClaim(User user)
    {
        var identityUser = await _userManager.FindByEmailAsync(user.Email!);
        var claims = await _userManager.GetClaimsAsync(identityUser!);
        var hasAdminClaim = claims.Any(c => c.Type == "isadmin");

        if (user.IsAdmin && !hasAdminClaim)
            await _userManager.AddClaimAsync(identityUser!, new Claim("isadmin", "true"));

        else if (!user.IsAdmin && hasAdminClaim)
            await _userManager.RemoveClaimAsync(identityUser!, new Claim("isadmin", "true"));
    }

    public async Task<ActionResult<UserProfileDTO>> GetUserProfile(string email)
    {
        var user = await _context.Users
            .ProjectTo<UserProfileDTO>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return NotFound("Usuário não encontrado");

        return user;
    }

    public IEnumerable<IdentityError> BuildIncorrectLoginErrorMessage()
    {
        return new List<IdentityError> { new IdentityError { Description = "E-mail ou senha inválido(s)." } };
    }

    public async Task<AuthenticationResponseDTO> BuildToken(User user)
    {
        var identityUser = await _userManager.FindByEmailAsync(user.Email!);

        if (identityUser == null)
            throw new Exception("Usuário não encontrado");

        var claims = new List<Claim>
        {
            new Claim("email", identityUser.Email!),
            new Claim("name", user.Name),
            new Claim("gender", user.Gender),
            new Claim("birthDate", user.DateOfBirth.ToString("yyyy-MM-dd"))
        };

        var claimsDB = await _userManager.GetClaimsAsync(identityUser);
        claims.AddRange(claimsDB);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwtkey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddYears(1);

        var securityToken = new JwtSecurityToken(
            issuer: null,
            audience: null,
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        var token = new JwtSecurityTokenHandler().WriteToken(securityToken);

        return new AuthenticationResponseDTO
        {
            Token = token,
            Expiration = expiration
        };
    }
}
