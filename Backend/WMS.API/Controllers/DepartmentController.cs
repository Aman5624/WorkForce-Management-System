using Microsoft.AspNetCore.Mvc;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Departments.ToList());
    }
}