using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.UserDTOs;

public class UserUpdateDTO
{
    [Required]
    public required string Name { get; set; }
    [Required]
    public required string Gender { get; set; }
    [Required]
    public required string Email { get; set; }
    [Required]
    public DateTime DateOfBirth { get; set; }
    [DataType(DataType.Password)]
    public required string NewPassword { get; set; }
    [Compare("NewPassword")]
    public required string RePassword { get; set; }
}
