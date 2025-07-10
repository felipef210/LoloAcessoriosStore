using Microsoft.EntityFrameworkCore;

namespace AcessoriosStoreAPI.Utilities;

public static class HttpContextExtentions
{
    public async static Task InsertPaginationParametersInHeader<T>(this HttpContext httpContext, IQueryable<T> queryable)
    {
        if (httpContext is null)
        {
            throw new ArgumentNullException(nameof(httpContext));
        }

        double count = await queryable.CountAsync();
        httpContext.Response.Headers.Append("total-records-count", count.ToString());
    }
}
