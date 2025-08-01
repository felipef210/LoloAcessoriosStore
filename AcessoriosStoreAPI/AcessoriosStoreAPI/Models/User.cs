using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AcessoriosStoreAPI.Models;

public class User : IdentityUser
{
    [Required(ErrorMessage = "You must fill the {0} field")]
    public required string Name { get; set; }
    [Required(ErrorMessage = "You must fill the {0} field")]
    public DateTime DateOfBirth { get; set; }
    [Required(ErrorMessage = "You must fill the {0} field")]
    public string Gender { get; set; }

    public bool IsAdmin { get; set; }
    public User() : base() { }
    public ICollection<AcessoryUser> FavoritedAcessories { get; set; }
}
