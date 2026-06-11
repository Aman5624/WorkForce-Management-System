using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _repository;

    public AttendanceController(IAttendanceRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn(CheckInDto dto)
    {
        var attendance = new Attendance
        {
            EmpId = dto.EmpId,
            CheckIn = DateTime.Now,
            AttendanceDate = DateTime.Today,
            WorkMode = dto.WorkMode
        };

        await _repository.CheckInAsync(attendance);

        return Ok("Checked In Successfully");
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckOut(CheckOutDto dto)
    {
        var attendance =
            await _repository.GetByIdAsync(dto.AttendanceId);

        if (attendance == null)
            return NotFound();

        attendance.CheckOut = DateTime.Now;

        attendance.TotalHours =
            (attendance.CheckOut.Value -
             attendance.CheckIn).TotalHours;

        await _repository.CheckOutAsync(attendance);

        return Ok("Checked Out Successfully");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _repository.GetAllAsync();

        return Ok(result);
    }
}