using FundTransfer.Api.Models;

namespace FundTransfer.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext db)
    {
        db.Database.EnsureCreated();

        if (db.Accounts.Any())
            return;

        db.Accounts.AddRange(
            new Account { Owner = "Alice Johnson", Balance = 1000.00m },
            new Account { Owner = "Bob Smith", Balance = 500.00m },
            new Account { Owner = "Charlie Brown", Balance = 250.00m }
        );

        db.SaveChanges();
    }
}