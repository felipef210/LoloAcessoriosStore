namespace AcessoriosStoreAPI.DTOs.AcessoryDTOs;

public class AcessoriesFilterDTO : PaginationDTO
{
    public string? Name { get; set; }
    public string? OrderBy { get; set; }
    public string? Category { get; set; }
}
