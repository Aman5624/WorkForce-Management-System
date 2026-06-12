using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementRepository _repository;

    public AnnouncementController(
        IAnnouncementRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _repository.GetAllAsync());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateAnnouncementDto dto)
    {
        var announcement = new Announcement
        {
            Title = dto.Title,
            Message = dto.Message,
            CreatedBy = dto.CreatedBy,
            CreatedOn = DateTime.Now,
            IsActive = true
        };

        await _repository.AddAsync(announcement);

        return Ok("Announcement Created");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateAnnouncementDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Announcement not found");

        existing.Title = dto.Title;
        existing.Message = dto.Message;
        existing.CreatedBy = dto.CreatedBy;

        await _repository.UpdateAsync(existing);
        return Ok("Announcement Updated");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Announcement not found");

        await _repository.DeleteAsync(id);
        return Ok("Announcement Deleted");
    }
}