using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FundTransfer.Api.Data;
using FundTransfer.Api.Models;

namespace FundTransfer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AccountsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
    {
        return await _db.Accounts.OrderBy(a => a.Id).ToListAsync();
    }
}