namespace AcessoriosStoreAPI.DTOs;

public class PaginationDTO
{
    public int Page { get; set; } = 1;

    private int recordsPerPage = 12;
    private int maximumRecordsPerPage = 50;

    public int RecordsPerPage 
    { 
        get { return recordsPerPage; } 
        set { recordsPerPage = (value > maximumRecordsPerPage) ? maximumRecordsPerPage : value; }
    }
}
