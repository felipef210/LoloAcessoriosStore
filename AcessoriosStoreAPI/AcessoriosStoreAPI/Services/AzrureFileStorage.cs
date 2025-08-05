
using Azure.Storage.Blobs;
using System.Data.Common;
using Azure.Storage.Blobs.Models;

namespace AcessoriosStoreAPI.Services;

public class AzureFileStorage : IFileStorage
{
    private readonly string connectionString;

    public AzureFileStorage(IConfiguration configuration)
    {
        connectionString = configuration.GetConnectionString("AzureConnection")!;
    }

    public async Task<List<string>> Store(string container, string folderName, List<IFormFile> files)
    {
        var client = new BlobContainerClient(connectionString, container);
        await client.CreateIfNotExistsAsync();
        client.SetAccessPolicy(PublicAccessType.Blob);

        var urls = new List<string>();

        foreach (var file in files)
        {
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var blobPath = $"{Sanitize(folderName)}/{fileName}";
            var blob = client.GetBlobClient(blobPath);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = file.ContentType
            };

            await blob.UploadAsync(file.OpenReadStream(), blobHttpHeaders);
            urls.Add(blob.Uri.ToString());
        }

        return urls;
    }

    public async Task Delete(string? route, string folderName, string container)
    {
        if (string.IsNullOrEmpty(route))
            return;

        var client = new BlobContainerClient(connectionString, container);
        await client.CreateIfNotExistsAsync();
        var fileName = Path.GetFileName(route);
        var blobPath = $"{Sanitize(folderName)}/{fileName}";
        var blob = client.GetBlobClient(blobPath);
        await blob.DeleteIfExistsAsync();
    }

    public async Task DeleteFolder(string folderName, string container)
    {
        var client = new BlobContainerClient(connectionString, container);
        await client.CreateIfNotExistsAsync();

        var sanitizedFolder = Sanitize(folderName);
        await foreach (var blobItem in client.GetBlobsAsync(prefix: sanitizedFolder + "/"))
        {
            var blobClient = client.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }
    }

    public static string Sanitize(string input)
    {
        return string.Concat(input
            .ToLower()
            .Normalize(System.Text.NormalizationForm.FormD)
            .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark))
            .Replace(" ", "-")
            .Replace("/", "-");
    }
}

