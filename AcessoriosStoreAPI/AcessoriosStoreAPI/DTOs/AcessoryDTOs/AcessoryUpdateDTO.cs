using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.AcessoryDTOs;

public class AcessoryUpdateDTO
{
    [Required(ErrorMessage = "You must fill the {0} field")]
    [StringLength(150)]
    public required string Name { get; set; }

    [Required(ErrorMessage = "You must fill the {0} field")]
    public required double Price { get; set; }

    public string Description { get; set; }

    [Required(ErrorMessage = "You must fill the {0} field")]
    public required string Category { get; set; }

    public List<IFormFile>? NewPictures { get; set; }

    public List<string> ExistingPictures { get; set; } = new();

    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
}
