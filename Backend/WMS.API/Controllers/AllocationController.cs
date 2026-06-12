using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AllocationController : ControllerBase
{
    private readonly IAllocationRepository _repository;

    public AllocationController(IAllocationRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _repository.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Allocate(
        AllocateEmployeeDto dto)
    {
        var allocation = new EmployeeProjectAllocation
        {
            EmpId = dto.EmpId,
            ProjectId = dto.ProjectId,
            AssignedOn = DateTime.Now,
            CreateDate = DateTime.Now,
            CreatedBy = dto.CreatedBy,
            Status = true
        };

        await _repository.AddAsync(allocation);

        return Ok("Employee Allocated Successfully");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAllocationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Allocation not found");

        existing.EmpId = dto.EmpId;
        existing.ProjectId = dto.ProjectId;
        existing.Status = dto.Status;

        await _repository.UpdateAsync(existing);
        return Ok("Allocation Updated Successfully");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Allocation not found");

        await _repository.DeleteAsync(id);
        return Ok("Allocation Deleted Successfully");
    }
}