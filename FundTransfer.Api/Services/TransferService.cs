using FundTransfer.Api.Data;
using FundTransfer.Api.DTOs;
using FundTransfer.Api.Models;

namespace FundTransfer.Api.Services;

public class TransferService : ITransferService
{
    private readonly AppDbContext _db;

    public TransferService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TransferResult> TransferAsync(TransferRequest request)
    {
        if (request.Amount <= 0)
            return new(TransferStatus.InvalidRequest, "Transfer amount must be greater than zero.");

        if (request.FromAccountId == request.ToAccountId)
            return new(TransferStatus.InvalidRequest, "Sender and recipient must be different accounts.");

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var from = await _db.Accounts.FindAsync(request.FromAccountId);
            var to = await _db.Accounts.FindAsync(request.ToAccountId);

            if (from is null || to is null)
                return new(TransferStatus.NotFound, "One or both accounts do not exist.");

            if (from.Balance < request.Amount)
            {
                Log(request, succeeded: false, "Insufficient funds.");
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return new(TransferStatus.InsufficientFunds,
                    $"Account {from.Id} has insufficient funds for this transfer.");
            }

            from.Balance -= request.Amount;
            to.Balance += request.Amount;

            Log(request, succeeded: true, "Transfer completed.");
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new(TransferStatus.Success,
                $"Transferred {request.Amount:0.00} from account {from.Id} to account {to.Id}.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return new(TransferStatus.Error, "An unexpected error occurred. No balances were changed.");
        }
    }

    private void Log(TransferRequest request, bool succeeded, string message)
    {
        _db.Transactions.Add(new TransferTransaction
        {
            FromAccountId = request.FromAccountId,
            ToAccountId = request.ToAccountId,
            Amount = request.Amount,
            Timestamp = DateTime.UtcNow,
            Succeeded = succeeded,
            Message = message
        });
    }
}