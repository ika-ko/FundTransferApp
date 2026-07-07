using Microsoft.EntityFrameworkCore;
using FundTransfer.Api.Models;

namespace FundTransfer.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<TransferTransaction> Transactions => Set<TransferTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>()
            .Property(a => a.Balance)
            .HasPrecision(18, 2);

        modelBuilder.Entity<TransferTransaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);
    }
}