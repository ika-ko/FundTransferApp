using Microsoft.AspNetCore.Mvc;
using FundTransfer.Api.DTOs;
using FundTransfer.Api.Services;

namespace FundTransfer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;

    public TransfersController(ITransferService transferService)
    {
        _transferService = transferService;
    }

    [HttpPost]
    public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
    {
        var result = await _transferService.TransferAsync(request);

        return result.Status switch
        {
            TransferStatus.Success => Ok(new { success = true, message = result.Message }),
            TransferStatus.InvalidRequest => BadRequest(new { success = false, message = result.Message }),
            TransferStatus.NotFound => NotFound(new { success = false, message = result.Message }),
            TransferStatus.InsufficientFunds => UnprocessableEntity(new { success = false, message = result.Message }),
            _ => StatusCode(500, new { success = false, message = result.Message })
        };
    }
}