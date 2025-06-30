using AcessoriosStoreAPI;
using AcessoriosStoreAPI.Context;
using AcessoriosStoreAPI.Services;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);
var connString = builder.Configuration["PostgresConnection"];

// Add services to the container.

builder.Services.AddDbContext<StoreContext>(options => options.UseNpgsql(connString));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddTransient<IFileStorage, AzureFileStorage>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
