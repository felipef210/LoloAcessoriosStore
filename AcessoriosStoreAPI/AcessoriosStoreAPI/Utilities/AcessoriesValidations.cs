namespace AcessoriosStoreAPI.Utilities;

public class AcessoriesValidations
{
    private Capitalize _capitalize;
    public AcessoriesValidations(Capitalize capitalize)
    {
        _capitalize = capitalize;
    }

    public bool IsValidCategory(string categoryInput)
    {
        List<string> categories = new List<string> { "Anel", "Bracelete", "Brinco", "Colar", "Pulseira" };
        categoryInput = _capitalize.CapitalizeFirstLetter(categoryInput);

        for (int i = 0; i < categories.Count; i++)
            if (categories[i] == categoryInput)
                return true;

        return false;
    }

    public bool IsValidPrice(double priceInput)
    {
        if (priceInput < 0) 
            return false;

        return true;
    }

    public string InputAcessoryFormat(string nameInput)
    {
        nameInput = _capitalize.CapitalizeFirstLetter(nameInput);
        return nameInput;
    }
}
