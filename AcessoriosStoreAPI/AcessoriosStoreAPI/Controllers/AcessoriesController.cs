﻿using AcessoriosStoreAPI.Context;
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
    public async Task<ActionResult<List<AcessoryDTO>>> Get(int page = 1, int pageSize = 12)
    {
        var query = _context.Acessories.AsQueryable();
        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
            .OrderByDescending(x => x.LastUpdate)
            .ToListAsync();

        return items;
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

    [HttpPost("filter")]
    [AllowAnonymous]
    public async Task<ActionResult<List<AcessoryDTO>>> Filter([FromBody] AcessoriesFilterDTO dto)
    {
        var query = _context.Acessories.AsQueryable();

        if (!string.IsNullOrEmpty(dto.Name))
            query = query.Where(a => a.Name.ToLower().Contains(dto.Name.ToLower()));

        if (!string.IsNullOrEmpty(dto.Category) && dto.Category != "Todos os produtos")
            query = query.Where(a => a.Category.ToLower().Contains(dto.Category.ToLower()));

        if (string.IsNullOrEmpty(dto.OrderBy))
            query = query.OrderByDescending(a => a.LastUpdate);

        else if (dto.OrderBy.ToLower() == "lowerprice")
            query = query.OrderBy(a => a.Price);

        else if (dto.OrderBy.ToLower() == "higherprice")
            query = query.OrderByDescending(a => a.Price);

        var result = await query.Paginate()
            .ProjectTo<AcessoryDTO>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
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
    public async Task<IActionResult> Put(int id, [FromQuery] int? pictureId, [FromForm] AcessoryCreationDTO acessoryUpdateDTO)
    {
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
        var folderName = acessory.Name;

        if (acessoryUpdateDTO.Pictures != null)
        {
            if (pictureId.HasValue)
            {
                var picture = await _context.AcessoryPictures.FirstOrDefaultAsync(p => p.Id == pictureId.Value);

                if (picture != null)
                {
                    await _fileStorage.Delete(picture.Url, folderName, _container);

                    _context.AcessoryPictures.Remove(picture);

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
            return NotFound("Acessório não encontrado.");

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
