using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetLogs()
    {
        return Ok(
            _context.AuditLogs
                .OrderByDescending(a => a.CreatedOn)
                .ToList());
    }
}