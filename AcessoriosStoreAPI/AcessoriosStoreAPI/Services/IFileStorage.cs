namespace AcessoriosStoreAPI.Services;

public interface IFileStorage
{
    Task<List<string>> Store(string container, string folderName, List<IFormFile> files);
    Task Delete(string route, string folderName, string container);
    Task DeleteFolder(string folderName, string container);
}
