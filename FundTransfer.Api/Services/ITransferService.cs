using FundTransfer.Api.DTOs;

namespace FundTransfer.Api.Services;

public interface ITransferService
{
    Task<TransferResult> TransferAsync(TransferRequest request);
}

public enum TransferStatus { Success, InvalidRequest, NotFound, InsufficientFunds, Error }

public record TransferResult(TransferStatus Status, string Message);