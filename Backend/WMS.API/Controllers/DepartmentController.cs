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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Department department)
    {
        if (id != department.DepartmentId)
            return BadRequest("Department ID mismatch");

        var existing = await _context.Departments.FindAsync(id);
        if (existing == null)
            return NotFound("Department not found");

        existing.DepartmentName = department.DepartmentName;
        existing.Description = department.Description;

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return NotFound("Department not found");

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();
        return Ok();
    }
}