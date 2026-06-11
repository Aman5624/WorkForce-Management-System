using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientController : ControllerBase
{
    private readonly IClientRepository _repository;

    public ClientController(IClientRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _repository.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientDto dto)
    {
        var client = new Client
        {
            ClientName = dto.ClientName,
            ClientAddress = dto.ClientAddress,
            ClientPhoneNumber = dto.ClientPhoneNumber,
            ClientLocation = dto.ClientLocation
        };

        await _repository.AddAsync(client);

        return Ok("Client Added Successfully");
    }
}