using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeRepository _repository;
    private readonly IAuditRepository _auditRepository;

    public EmployeeController(
        IEmployeeRepository repository,
        IAuditRepository auditRepository)
    {
        _repository = repository;
        _auditRepository = auditRepository;
    }

    // GET: api/Employee
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _repository.GetAllAsync();

        var result = employees.Select(e => new EmployeeDto
        {
            EmployeeId = e.EmployeeId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            PhoneNumber = e.PhoneNumber,
            Gender = e.Gender.ToString(),
            DOB = e.DOB,
            DOJ = e.DOJ,
            DepartmentName = e.Department?.DepartmentName ?? "",
            RoleName = e.Role?.RoleName ?? "",
            Status = e.Status
        });

        return Ok(result);
    }

    [Authorize(Roles = "Admin,Manager,Employee")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await _repository.GetByIdAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        var result = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            Gender = employee.Gender.ToString(),
            DOB = employee.DOB,
            DOJ = employee.DOJ,
            DepartmentName = employee.Department?.DepartmentName ?? "",
            RoleName = employee.Role?.RoleName ?? "",
            Status = employee.Status
        };

        return Ok(result);
    }

    // POST: api/Employee
    [HttpPost]
    public async Task<IActionResult> Create(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Gender = dto.Gender,
            DOB = dto.DOB,
            DOJ = dto.DOJ,
            DepartmentId = dto.DepartmentId,
            RoleId = dto.RoleId,
            Status = "Active"
        };

        await _repository.AddAsync(employee);

        await _auditRepository.AddLogAsync(
            new AuditLog
            {
                EntityName = "Employee",
                RecordId = employee.EmployeeId,
                Action = "Insert",
                CreatedBy = 1,
                CreatedOn = DateTime.Now
            });

        return Ok("Employee Added Successfully");
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto dto)
    {
        var employee = await _repository.GetByIdAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        employee.FirstName = dto.FirstName;
        employee.LastName = dto.LastName;
        employee.Email = dto.Email;
        employee.PhoneNumber = dto.PhoneNumber;
        employee.DepartmentId = dto.DepartmentId;
        employee.RoleId = dto.RoleId;
        employee.Status = dto.Status;

        await _repository.UpdateAsync(employee);

        await _auditRepository.AddLogAsync(
            new AuditLog
            {
                EntityName = "Employee",
                RecordId = employee.EmployeeId,
                Action = "Update",
                CreatedBy = 1,
                CreatedOn = DateTime.Now
            });

        return Ok("Employee Updated Successfully");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _repository.GetByIdAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        await _auditRepository.AddLogAsync(
            new AuditLog
            {
                EntityName = "Employee",
                RecordId = id,
                Action = "Delete",
                CreatedBy = 1,
                CreatedOn = DateTime.Now
            });

        await _repository.DeleteAsync(id);

        return Ok("Employee Deleted Successfully");
    }
}