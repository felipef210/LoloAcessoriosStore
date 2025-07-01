using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.DTOs.UserDTOs;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Services;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
    private readonly UserService _userService;
    private readonly IConfiguration _configuration;

    public UsersController(StoreContext context, IMapper mapper, UserManager<User> userManager, SignInManager<User> signInManager, UserService userService, IConfiguration configuration)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _signInManager = signInManager;
        _userService = userService;
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
        return await _userService.GetUserProfile(email);
    }

    [HttpGet("getuser")]
    public async Task<ActionResult<UserProfileDTO>> GetOwnProfile()
    {
        var emailUsuarioLogado = User.FindFirstValue("email");

        if (string.IsNullOrEmpty(emailUsuarioLogado))
            return Unauthorized("Token inválido ou expirado.");

        return await _userService.GetUserProfile(emailUsuarioLogado);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticationResponseDTO>> Register([FromBody] UserCreationDTO userCreationDTO)
    {
        if (_context.Users.Any(u => u.Email == userCreationDTO.Email))
            return ValidationProblem("E-mail já cadastrado.");

        if (!_userService.IsPasswordValid(userCreationDTO.Password))
            return ValidationProblem("A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.");

        if (!_userService.IsFullName(userCreationDTO.Name))
            return ValidationProblem("Digite o seu nome completo.");

        if (!_userService.GenderValidation(userCreationDTO.Gender))
            return ValidationProblem("Opção inválida, favor selecione uma das opções disponíveis.");

        userCreationDTO.Name = _userService.CapitalizeFullName(userCreationDTO.Name);
        userCreationDTO.Gender = _userService.CapitalizeFirstLetter(userCreationDTO.Gender);

        var user = _mapper.Map<User>(userCreationDTO);
        var result = await _userManager.CreateAsync(user, userCreationDTO.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return await _userService.BuildToken(user);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticationResponseDTO>> Login([FromBody] UserLoginDTO userCredentialsDTO)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userCredentialsDTO.Email);

        if (user == null)
            return BadRequest(_userService.BuildIncorrectLoginErrorMessage());

        var result = await _signInManager.CheckPasswordSignInAsync(user, userCredentialsDTO.Password, lockoutOnFailure: false);

        if (!result.Succeeded)
            return BadRequest(_userService.BuildIncorrectLoginErrorMessage());

        await _userService.UpdateAdminClaim(user);
        return await _userService.BuildToken(user);
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
}