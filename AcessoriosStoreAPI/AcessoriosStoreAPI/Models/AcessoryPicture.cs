using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AcessoriosStoreAPI.Models;

public class AcessoryPicture
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    [Required]
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
    public int AcessoryId { get; set; }
    public Acessory Acessory { get; set; } = null!;
}
