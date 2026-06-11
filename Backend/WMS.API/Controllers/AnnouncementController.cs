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
}