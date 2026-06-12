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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Role roleUpdate)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
            return NotFound("Role not found");

        var lowerName = role.RoleName.ToLower();
        if (lowerName == "admin" || lowerName == "manager" || lowerName == "employee")
        {
            return BadRequest("Cannot edit system roles");
        }

        role.RoleName = roleUpdate.RoleName;
        
        await _context.SaveChangesAsync();
        return Ok("Role Updated Successfully");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
            return NotFound("Role not found");

        var lowerName = role.RoleName.ToLower();
        if (lowerName == "admin" || lowerName == "manager" || lowerName == "employee")
        {
            return BadRequest("Cannot delete system roles");
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return Ok("Role Deleted Successfully");
    }
}