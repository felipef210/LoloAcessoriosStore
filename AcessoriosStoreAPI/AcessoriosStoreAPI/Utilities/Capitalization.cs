namespace AcessoriosStoreAPI.Utilities;

public class Capitalization : ICapitalize
{
    public string CapitalizeFirstLetter(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        input = input.ToLower();
        return char.ToUpper(input[0]) + input.Substring(1);
    }

    public string CapitalizeFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return fullName;

        string[] lowercaseWords = { "da", "de", "do", "dos", "das" };

        return string.Join(" ", fullName
            .ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select((word, index) =>
            {
                if (index == 0 || !lowercaseWords.Contains(word))
                    return char.ToUpper(word[0]) + word.Substring(1);
                else
                    return word;
            }));
    }
}
