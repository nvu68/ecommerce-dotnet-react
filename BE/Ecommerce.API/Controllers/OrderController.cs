using Ecommerce.Application.DTOs.Order;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Bắt buộc phải có Token (đăng nhập) mới được chốt đơn
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdString!);
    }

    // Bổ sung hàm này để Admin lấy danh sách đơn hàng
    [HttpGet]
    // Tạm thời bỏ [Authorize] hoặc cấp quyền Admin cho hàm này nếu cần
    [HttpGet("my-orders")]
    [Authorize] // Bắt buộc đăng nhập mới được xem
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = Guid.Parse(userIdString);
        var orders = await _orderService.GetUserOrdersAsync(userId);

        return Ok(orders);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        await _orderService.DeleteOrderAsync(id);
        return Ok(new { message = "Đã xóa đơn hàng thành công!" });
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var userId = Guid.Parse(userIdString);
        await _orderService.CheckoutAsync(userId, request); // Truyền request vào

        return Ok(new { message = "Đặt hàng thành công!" });
    }

    // API lấy tất cả đơn hàng cho Admin
    [HttpGet("all")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    // API cập nhật trạng thái
    public class UpdateStatusDto { public string Status { get; set; } }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto request)
    {
        try
        {
            await _orderService.UpdateOrderStatusAsync(id, request.Status);
            return Ok(new { message = "Đã cập nhật trạng thái đơn hàng!" });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}