namespace AcessoriosStoreAPI.DTOs;

public class PaginatedDTO<T>
{
    public List<T> Items { get; set; }
    public int TotalItems { get; set; }
}
