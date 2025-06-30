using System.Text.RegularExpressions;

namespace AcessoriosStoreAPI.Utilities;

public class UsersValidations : Capitalize
{
    public bool IsPasswordValid(string password)
    {
        Regex regex = new Regex(@"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&_*-])[A-Za-z\d!@#$%^&_*-]{8,}$");
        return regex.IsMatch(password);
    }

    public bool IsFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return false;

        string[] separatedName = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return separatedName.Length > 1;
    }

    public bool GenderValidation(string gender)
    {
        string[] validOptions = { "Masculino", "Feminino", "Outros" };
        return validOptions.Contains(gender, StringComparer.OrdinalIgnoreCase);
    }
}
