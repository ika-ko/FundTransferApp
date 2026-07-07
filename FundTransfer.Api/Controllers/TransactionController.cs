using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FundTransfer.Api.Data;
using FundTransfer.Api.Models;

namespace FundTransfer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransferTransaction>>> GetTransactions()
    {
        return await _db.Transactions
            .OrderByDescending(t => t.Timestamp)
            .ToListAsync();
    }
}