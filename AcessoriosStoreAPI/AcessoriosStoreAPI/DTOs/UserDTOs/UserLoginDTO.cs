using System.ComponentModel.DataAnnotations;

namespace AcessoriosStoreAPI.DTOs.UserDTOs;

public class UserLoginDTO
{
    [Required]
    public required string Email { get; set; }
    [Required] 
    public string Password { get; set; }
}
