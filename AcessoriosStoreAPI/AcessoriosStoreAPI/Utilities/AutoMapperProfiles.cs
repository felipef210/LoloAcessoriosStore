using AcessoriosStoreAPI.DTOs.AcessoryDTOs;
using AcessoriosStoreAPI.DTOs.UserDTOs;
using AcessoriosStoreAPI.Models;
using AutoMapper;

namespace AcessoriosStoreAPI.Utilities;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        ConfigureAcessory();
        ConfigureUser();
    }

    private void ConfigureAcessory()
    {
        CreateMap<AcessoryCreationDTO, Acessory>()
            .ForMember(dest => dest.Pictures, opt => opt.Ignore());

        CreateMap<Acessory, AcessoryDTO>()
            .ForMember(dest => dest.Pictures, opt => opt.MapFrom(src =>
                src.Pictures.Select(p => p.Url).ToList()));
    }

    private void ConfigureUser()
    {
        CreateMap<UserCreationDTO, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

        CreateMap<User, UserDTO>();
        CreateMap<User, UserProfileDTO>();

        CreateMap<UserUpdateDTO, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

        CreateMap<UserUpdateOwnProfileDTO, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));
    }
}
