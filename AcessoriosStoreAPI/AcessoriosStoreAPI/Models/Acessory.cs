using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AcessoriosStoreAPI.Models;

public class Acessory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "You must fill the {0} field")]
    [StringLength(150)]
    public required string Name { get; set; }

    [Required(ErrorMessage = "You must fill the {0} field")]
    public required double Price { get; set; }

    public string Description { get; set; }

    [Required(ErrorMessage = "You must fill the {0} field")]
    public required string Category { get; set; }
    public DateTime LastUpdate { get; set; }

    public ICollection<AcessoryPicture> Pictures { get; set; } = new List<AcessoryPicture>();

    public ICollection<AcessoryUser> FavoritedByUsers { get; set; }
}
