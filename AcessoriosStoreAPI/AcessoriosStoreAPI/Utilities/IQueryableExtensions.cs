namespace AcessoriosStoreAPI.Utilities;

public static class IQueryableExtensions
{
    public static IQueryable<T> Paginate<T>(this IQueryable<T> queryable, int page = 1, int recordsPerPage = 12)
    {
        return queryable
            .Skip((page - 1) * recordsPerPage)
            .Take(recordsPerPage);
    }
}
