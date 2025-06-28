using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.Models;

public class AcessoryUser
{
    [Required]
    public int AcessoryId { get; set; }
    [Required]
    public string UserId { get; set; }
    public virtual Acessory Acessory { get; set; }
    public virtual User User { get; set; }  
}
