using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveRepository _repository;

    public LeaveController(ILeaveRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("apply")]
    public async Task<IActionResult> ApplyLeave(ApplyLeaveDto dto)
    {
        var leave = new Leave
        {
            EmpId = dto.EmpId,
            LeaveType = dto.LeaveType,
            Reason = dto.Reason,
            FromDate = dto.FromDate,
            ToDate = dto.ToDate,
            Status = "Pending",
            AppliedOn = DateTime.Now
        };

        await _repository.ApplyLeaveAsync(leave);

        return Ok("Leave Applied Successfully");
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("approve")]
    public async Task<IActionResult> ApproveLeave(ApproveLeaveDto dto)
    {
        var leave = await _repository.GetByIdAsync(dto.LeaveId);

        if (leave == null)
            return NotFound();

        leave.Status = "Approved";
        leave.ApprovedBy = dto.ApprovedBy;
        leave.ApprovedOn = DateTime.Now;

        await _repository.UpdateAsync(leave);

        return Ok("Leave Approved");
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("reject")]
    public async Task<IActionResult> RejectLeave(RejectLeaveDto dto)
    {
        var leave = await _repository.GetByIdAsync(dto.LeaveId);

        if (leave == null)
            return NotFound();

        leave.Status = "Rejected";
        leave.ApprovedBy = dto.ApprovedBy;
        leave.ApprovedOn = DateTime.Now;

        await _repository.UpdateAsync(leave);

        return Ok("Leave Rejected");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var leaves = await _repository.GetAllAsync();

        return Ok(leaves);
    }
}