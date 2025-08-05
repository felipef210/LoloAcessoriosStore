using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.DTOs;
using AcessoriosStoreAPI.DTOs.AcessoryDTOs;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Services;
using AcessoriosStoreAPI.Utilities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AcessoriosStoreAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
public class AcessoriesController : ControllerBase
{
    private readonly StoreContext _context;
    private readonly IMapper _mapper;
    private readonly string _container = "acessories";
    private readonly IFileStorage _fileStorage;
    private readonly AcessoryService _acessoryService;

    public AcessoriesController(StoreContext context, IMapper mapper, IFileStorage fileStorage, AcessoryService acessoryService)
    {
        _context = context;
        _mapper = mapper;
        _fileStorage = fileStorage;
        _acessoryService = acessoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<AcessoryDTO>>> Get([FromQuery] PaginationDTO pagination)
    {
        var query = _context.Acessories.AsQueryable();
        await HttpContext.InsertPaginationParametersInHeader(query);
        return await query
                    .OrderByDescending(a => a.LastUpdate)
                    .Paginate(pagination)
                    .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
                    .ToListAsync();
    }

    [HttpGet("{id}", Name = "GetAcessoryById")]
    [AllowAnonymous]
    public async Task<ActionResult<AcessoryDTO>> GetAcessory(int id)
    {
        var acessory = await _context.Acessories
                            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
                            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado.");

        return acessory;
    }

    [HttpGet("filter")]
    [AllowAnonymous]
    public async Task<ActionResult<List<AcessoryDTO>>> Filter([FromQuery] AcessoriesFilterDTO filter, [FromQuery] PaginationDTO pagination)
    {
        var query = _context.Acessories.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Name))
            query = query.Where(a => a.Name.ToLower().Contains(filter.Name.ToLower()));

        if (!string.IsNullOrEmpty(filter.Category) && filter.Category != "Todos os produtos")
            query = query.Where(a => a.Category.ToLower().Contains(filter.Category.ToLower()));

        if (string.IsNullOrEmpty(filter.OrderBy))
            query = query.OrderByDescending(a => a.LastUpdate);

        else if (filter.OrderBy.ToLower() == "lowerprice")
            query = query.OrderBy(a => a.Price);

        else if (filter.OrderBy.ToLower() == "higherprice")
            query = query.OrderByDescending(a => a.Price);

        await HttpContext.InsertPaginationParametersInHeader(query);

        var result = await query
                            .Paginate(pagination)
                            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
                            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<ActionResult<AcessoryDTO>> Post([FromForm] AcessoryCreationDTO acessoryCreationDTO)
    {
        acessoryCreationDTO.Name = _acessoryService.CapitalizeFirstLetter(acessoryCreationDTO.Name);
        acessoryCreationDTO.Category = _acessoryService.CapitalizeFirstLetter(acessoryCreationDTO.Category);

        if (!_acessoryService.IsValidPrice(acessoryCreationDTO.Price))
            return BadRequest("Preço do acessório inválido.");

        if (!_acessoryService.IsValidCategory(acessoryCreationDTO.Category))
            return BadRequest("Categoria não existe no contexto.");

        var acessory = _mapper.Map<Acessory>(acessoryCreationDTO);
        var folderName = acessory.Name;

        if (acessoryCreationDTO.Pictures is not null)
        {
            var urls = await _fileStorage.Store(_container, folderName, acessoryCreationDTO.Pictures);
            acessory.Pictures = urls.Select(url => new AcessoryPicture { Url = url }).ToList();
        }

        _context.Add(acessory);
        await _context.SaveChangesAsync();

        var acessoryDTO = _mapper.Map<AcessoryDTO>(acessory);
        return CreatedAtRoute("GetAcessoryById", new { id = acessoryDTO.Id }, acessoryDTO);
    }

    [HttpPut("{id:int}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<IActionResult> Put(int id, [FromForm] AcessoryUpdateDTO acessoryUpdateDTO)
    {
        // -------------Normal fields-------------
        var acessory = await _context.Acessories
            .Include(a => a.Pictures)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado.");

        acessoryUpdateDTO.Name = _acessoryService.CapitalizeFirstLetter(acessoryUpdateDTO.Name);
        acessoryUpdateDTO.Category = _acessoryService.CapitalizeFirstLetter(acessoryUpdateDTO.Category);

        if (!_acessoryService.IsValidPrice(acessoryUpdateDTO.Price))
            return BadRequest("Preço do acessório inválido.");

        if (!_acessoryService.IsValidCategory(acessoryUpdateDTO.Category))
            return BadRequest("Categoria não existe no contexto.");

        acessory = _mapper.Map(acessoryUpdateDTO, acessory);
        // ---------------------------------------

        // -------------File managment-------------
        var folderName = acessory.Name;

        var picturesToRemove = acessory.Pictures
            .Where(p => !acessoryUpdateDTO.ExistingPictures.Contains(p.Url))
            .ToList();

        foreach ( var picture in picturesToRemove)
        {
            await _fileStorage.Delete(picture.Url, folderName, _container);
            _context.AcessoryPictures.Remove(picture);
        }

        // Add new file If there is any new file in the form
        if (acessoryUpdateDTO.NewPictures?.Any() == true)
        {
            var urls = await _fileStorage.Store(_container, folderName, acessoryUpdateDTO.NewPictures);
            foreach (var url in urls)
                acessory.Pictures.Add(new AcessoryPicture { Url = url });
        }
        // ---------------------------------------

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "isadmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var acessory = await _context.Acessories
            .Include(a => a.Pictures)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado.");

        var folderName = acessory.Name;

        foreach(var picture in acessory.Pictures)
        {
            await _fileStorage.Delete(picture.Url, folderName, _container);
        }

        await _fileStorage.DeleteFolder(folderName, _container);

        _context.Remove(acessory);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
