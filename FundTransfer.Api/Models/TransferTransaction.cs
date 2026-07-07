namespace FundTransfer.Api.Models;

public class TransferTransaction
{
    public int Id { get; set; }
    public int FromAccountId { get; set; }
    public int ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Timestamp { get; set; }
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
}