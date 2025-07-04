using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.DTOs.AcessoryDTOs;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Utilities;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace AcessoriosStoreAPI.Services;

public class AcessoryService
{
    private readonly ICapitalize _capitalize;

    public AcessoryService(ICapitalize capitalize)
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

    public string CapitalizeFirstLetter(string acessoryNameInput)
    {
        acessoryNameInput = _capitalize.CapitalizeFirstLetter(acessoryNameInput);
        return acessoryNameInput;
    }
}
