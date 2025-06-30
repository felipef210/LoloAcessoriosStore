using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AcessoriosStoreAPI.Context;
using AutoMapper;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.DTOs.AcessoryDTOs;
using AcessoriosStoreAPI.Services;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;

namespace AcessoriosStoreAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AcessoriesController : ControllerBase
{
    private readonly StoreContext _context;
    private readonly IMapper _mapper;
    private readonly string _container = "acessories";
    private readonly IFileStorage _fileStorage;

    public AcessoriesController(StoreContext context, IMapper mapper, IFileStorage fileStorage)
    {
        _context = context;
        _mapper = mapper;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<ActionResult<List<AcessoryDTO>>> Get(int page = 1, int pageSize = 12)
    {
        var query = _context.Acessories.AsQueryable();
        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return items;
    }

    [HttpGet("acessory/{id}", Name = "GetAcessoryById")]
    public async Task<ActionResult<AcessoryDTO>> GetAcessory(int id)
    {
        var acessory = await _context.Acessories
                            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
                            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado");

        return acessory;
    }

    [HttpPost]
    public async Task<CreatedAtRouteResult> Post([FromForm] AcessoryCreationDTO acessoryCreationDTO)
    {
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
    public async Task<IActionResult> Put(int id, [FromQuery] int? pictureId, [FromForm] AcessoryCreationDTO acessoryUpdateDTO)
    {
        var acessory = await _context.Acessories
            .Include(a => a.Pictures)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado");

        acessory = _mapper.Map(acessoryUpdateDTO, acessory);
        var folderName = acessory.Name;

        if (acessoryUpdateDTO.Pictures != null)
        {
            if (pictureId.HasValue)
            {
                var picture = await _context.AcessoryPictures.FirstOrDefaultAsync(p => p.Id == pictureId.Value);

                if (picture != null)
                {
                    // Deleta a imagem do Blob Storage
                    await _fileStorage.Delete(picture.Url, folderName, _container);

                    // Remove do banco
                    _context.AcessoryPictures.Remove(picture);

                    // Salva a nova imagem no mesmo lugar
                    var urls = await _fileStorage.Store(_container, folderName, acessoryUpdateDTO.Pictures);
                    foreach (var url in urls)
                    {
                        acessory.Pictures.Add(new AcessoryPicture { Url = url });
                    }
                }
            }
            else
            {
                var urls = await _fileStorage.Store(_container, folderName, acessoryUpdateDTO.Pictures);
                foreach (var url in urls)
                {
                    acessory.Pictures.Add(new AcessoryPicture { Url = url });
                }
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var acessory = await _context.Acessories
            .Include(a => a.Pictures)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (acessory is null)
            return NotFound("Acessório não encontrado");

        var folderName = acessory.Name;

        foreach(var picture in acessory.Pictures)
        {
            await _fileStorage.Delete(picture.Url, folderName, _container);
        }

        _context.Remove(acessory);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
