using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.AcessoryDTOs;

public class AcessoryDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required double Price { get; set; }
    public string Description { get; set; }
    public required string Category { get; set; }
    public List<string>? Pictures { get; set; }
    public DateTime LastUpdate { get; set; }
}
