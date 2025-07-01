using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.DTOs.AcessoryDTOs;
using AcessoriosStoreAPI.DTOs.UserDTOs;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Utilities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AcessoriosStoreAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UsersController : ControllerBase
{
    private readonly StoreContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly UsersValidations _usersValidations;
    private readonly IConfiguration _configuration;

    public UsersController(StoreContext context, IMapper mapper, UserManager<User> userManager, SignInManager<User> signInManager, UsersValidations usersValidations, IConfiguration configuration)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _signInManager = signInManager;
        _usersValidations = usersValidations;
        _configuration = configuration;
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<ActionResult<List<UserDTO>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _context.Users.AsQueryable();
        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<UserDTO>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return items;
    }

    [HttpGet("admin/getuser/{email}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<ActionResult<UserProfileDTO>> GetProfile(string email)
    {
        return await GetUserProfile(email);
    }

    [HttpGet("getuser")]
    public async Task<ActionResult<UserProfileDTO>> GetOwnProfile()
    {
        var emailUsuarioLogado = User.FindFirstValue("email");

        if (string.IsNullOrEmpty(emailUsuarioLogado))
            return Unauthorized("Token inválido ou expirado.");

        return await GetUserProfile(emailUsuarioLogado);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticationResponseDTO>> Register([FromBody] UserCreationDTO userCreationDTO)
    {
        if (_context.Users.Any(u => u.Email == userCreationDTO.Email))
            return ValidationProblem("E-mail já cadastrado.");

        if (!_usersValidations.IsPasswordValid(userCreationDTO.Password))
            return ValidationProblem("A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.");

        if (!_usersValidations.IsFullName(userCreationDTO.Name))
            return ValidationProblem("Digite o seu nome completo.");

        if (!_usersValidations.GenderValidation(userCreationDTO.Gender))
            return ValidationProblem("Opção inválida, favor selecione uma das opções disponíveis.");

        userCreationDTO.Name = _usersValidations.CapitalizeFullName(userCreationDTO.Name);
        userCreationDTO.Gender = _usersValidations.CapitalizeFirstLetter(userCreationDTO.Gender);

        var user = _mapper.Map<User>(userCreationDTO);
        var result = await _userManager.CreateAsync(user, userCreationDTO.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return await BuildToken(user);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticationResponseDTO>> Login([FromBody] UserLoginDTO userCredentialsDTO)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userCredentialsDTO.Email);

        if (user == null)
            return BadRequest(BuildIncorrectLoginErrorMessage());

        var result = await _signInManager.CheckPasswordSignInAsync(user, userCredentialsDTO.Password, lockoutOnFailure: false);

        if (!result.Succeeded)
            return BadRequest(BuildIncorrectLoginErrorMessage());

        await UpdateAdminClaim(user);
        return await BuildToken(user);
    }

    [HttpPost("makeadmin")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<IActionResult> MakeAdmin([FromBody] EditClaimDTO editClaimDTO)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == editClaimDTO.Email);

        if (user is null) 
            return NotFound();

        user.IsAdmin = true;
        await _context.SaveChangesAsync();

        var identityUser = await _userManager.FindByEmailAsync(user.Email);
        await _userManager.AddClaimAsync(identityUser!, new Claim("isadmin", "true"));
        return NoContent();
    }

    [HttpPost("removeadmin")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<IActionResult> RemoveAdmin([FromBody] EditClaimDTO editClaimDTO)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == editClaimDTO.Email);

        if (user is null) 
            return NotFound();

        user.IsAdmin = false;
        await _context.SaveChangesAsync();

        var identityUser = await _userManager.FindByEmailAsync(user.Email!);
        await _userManager.RemoveClaimAsync(identityUser!, new Claim("isadmin", "true"));
        return NoContent();
    }

    // The main role of this function is to allow the DB Manager to update some user role directly in a DB Management.
    // The user's claim will be updated when he/she log in.
    private async Task UpdateAdminClaim(User user)
    {
        var identityUser = await _userManager.FindByEmailAsync(user.Email!);
        var claims = await _userManager.GetClaimsAsync(identityUser!);
        var hasAdminClaim = claims.Any(c => c.Type == "isadmin");

        if (user.IsAdmin && !hasAdminClaim)
            await _userManager.AddClaimAsync(identityUser!, new Claim("isadmin", "true"));

        else if (!user.IsAdmin && hasAdminClaim)
            await _userManager.RemoveClaimAsync(identityUser!, new Claim("isadmin", "true"));
    }

    private async Task<ActionResult<UserProfileDTO>> GetUserProfile(string email)
    {
        var user = await _context.Users
            .ProjectTo<UserProfileDTO>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return NotFound("Usuário não encontrado");

        return user;
    }

    private IEnumerable<IdentityError> BuildIncorrectLoginErrorMessage()
    {
        return new List<IdentityError> { new IdentityError { Description = "E-mail ou senha inválido(s)." } };
    }

    private async Task<AuthenticationResponseDTO> BuildToken(User user)
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