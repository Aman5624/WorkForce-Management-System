using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Application.DTOs;
using WMS.Application.Services;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace WMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(
        AppDbContext context,
        ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new UserLogin
        {
            Username = dto.Username,
            PasswordHash = dto.Password,
            RoleId = dto.RoleId
        };

        _context.UserLogins.Add(user);

        await _context.SaveChangesAsync();

        return Ok("User Registered Successfully");
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.UserLogins
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Username == dto.Username &&
                u.PasswordHash == dto.Password);

        if (user == null)
            return Unauthorized("Invalid Username or Password");

        var token =
            _tokenService.GenerateToken(
                user,
                user.Role?.RoleName ?? "Employee");

        return Ok(new
        {
            Token = token
        });
    }
}