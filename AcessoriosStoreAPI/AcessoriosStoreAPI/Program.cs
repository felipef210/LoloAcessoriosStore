using AcessoriosStoreAPI;
using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.Models;
using AcessoriosStoreAPI.Services;
using AcessoriosStoreAPI.Utilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
var connString = builder.Configuration["PostgresConnection"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader()
        .WithExposedHeaders("total-records-count");
    });
});

// Add services to the container.

builder.Services.AddDbContext<StoreContext>(options => options.UseNpgsql(connString));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddTransient<IFileStorage, AzureFileStorage>();

builder.Services.AddScoped<ICapitalize, Capitalization>();
builder.Services.AddScoped<AcessoryService>();
builder.Services.AddScoped<UserService>();

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<StoreContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.MapInboundClaims = false;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["jwtkey"]!)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("isadmin", policy => policy.RequireClaim("isadmin"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
