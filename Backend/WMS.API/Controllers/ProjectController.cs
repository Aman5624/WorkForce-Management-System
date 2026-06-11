using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectRepository _repository;

    public ProjectController(IProjectRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _repository.GetAllAsync();

        var result = projects.Select(p => new ProjectDto
        {
            ProjectId = p.ProjectId,
            ProjectName = p.ProjectName,
            ClientName = p.Client?.ClientName ?? "",
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = p.Status
        });

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectDto dto)
    {
        var project = new Project
        {
            ProjectName = dto.ProjectName,
            ClientId = dto.ClientId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = "Active"
        };

        await _repository.AddAsync(project);

        return Ok("Project Created Successfully");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProjectDto dto)
    {
        var project = await _repository.GetByIdAsync(id);

        if (project == null)
            return NotFound();

        project.ProjectName = dto.ProjectName;
        project.ClientId = dto.ClientId;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.Status = dto.Status;

        await _repository.UpdateAsync(project);

        return Ok("Project Updated Successfully");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);

        return Ok("Project Deleted Successfully");
    }
}