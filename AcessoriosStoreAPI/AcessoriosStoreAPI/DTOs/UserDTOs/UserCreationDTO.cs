using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.UserDTOs;

public class UserCreationDTO
{
    [Required]
    public required string Name { get; set; }
    [Required]
    public DateTime DateOfBirth { get; set; }
    [Required]
    public required string Gender { get; set; }
    [Required]
    public required string Email { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public required string Password { get; set; }
    [Required]
    [Compare("Password")]
    public required string RePassword { get; set; }

}
