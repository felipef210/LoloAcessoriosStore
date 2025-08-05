using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcessoriosStoreAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderToAcessoryPicture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "AcessoryPictures",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "AcessoryPictures");
        }
    }
}
