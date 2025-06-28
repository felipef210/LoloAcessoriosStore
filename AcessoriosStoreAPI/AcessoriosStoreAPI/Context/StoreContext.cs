using AcessoriosStoreAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AcessoriosStoreAPI.Context;

public class StoreContext : IdentityDbContext
{
    public StoreContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AcessoryUser>().HasKey(e => new { e.AcessoryId, e.UserId });

        modelBuilder.Entity<AcessoryPicture>()
            .HasOne(ap => ap.Acessory)
            .WithMany(a => a.Pictures)
            .HasForeignKey(ap => ap.AcessoryId);
    }

    public DbSet<Acessory> Acessories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<AcessoryUser> AcessoryUsers { get; set; }
    public DbSet<AcessoryPicture> AcessoryPictures { get; set; }
    

}
