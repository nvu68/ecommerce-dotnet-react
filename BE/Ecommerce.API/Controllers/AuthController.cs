using Ecommerce.Application.DTOs.Auth;
using Ecommerce.Application.Interfaces;
using Ecommerce.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _context;

    public AuthController(IAuthService authService, ApplicationDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        // Nếu kết quả là null (tức là sai pass hoặc không thấy user)
        if (result == null)
        {
            // Trả về lỗi 400 kèm câu thông báo
            return BadRequest(new { message = "Email hoặc mật khẩu không chính xác!" });
        }

        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        // CÁCH 1: Nếu sếp có Interface IUserService, hãy gọi qua nó
        // CÁCH 2: Nếu không có, sếp gọi thẳng Repository (đây là cách nhanh nhất để lấy data)
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }
}