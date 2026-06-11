using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetDashboard()
    {
        var dashboard = new DashboardDto
        {
            TotalEmployees = _context.Employees.Count(),
            TotalDepartments = _context.Departments.Count(),
            TotalProjects = _context.Projects.Count(),

            PendingLeaves =
                _context.Leaves.Count(l => l.Status == "Pending"),

            PresentToday =
                _context.Attendances.Count(a =>
                    a.AttendanceDate == DateTime.Today)
        };

        return Ok(dashboard);
    }
}