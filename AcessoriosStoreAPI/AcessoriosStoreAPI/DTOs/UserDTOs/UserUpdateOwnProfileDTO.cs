using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.UserDTOs;

public class UserUpdateOwnProfileDTO
{
    [Required]
    public string Name { get; set; }
    [Required]
    public required string Gender { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public DateTime DateOfBirth { get; set; }
    [DataType(DataType.Password)]
    public string? CurrentPassword { get; set; }
    [DataType(DataType.Password)]
    public string? NewPassword { get; set; }
    [Compare("NewPassword")]
    public required string RePassword { get; set; }
}
