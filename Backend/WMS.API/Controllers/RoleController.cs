using Microsoft.AspNetCore.Mvc;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoleController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Roles.ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Create(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return Ok("Role Added Successfully");
    }
}