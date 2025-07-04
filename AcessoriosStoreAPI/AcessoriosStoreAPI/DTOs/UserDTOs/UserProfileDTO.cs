namespace AcessoriosStoreAPI.DTOs.UserDTOs;

public class UserProfileDTO
{
    public string Name { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; }
    public string Email { get; set; }
    public bool IsAdmin { get; set; }
}
