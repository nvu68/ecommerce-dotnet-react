using Ecommerce.Application.DTOs.Cart; // Bắt buộc phải có dòng này
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdString!);
    }

    // 1. API Lấy giỏ hàng (Đã sửa tên hàm thành GetCartAsync)
    [HttpGet]
    public async Task<IActionResult> GetMyCart()
    {
        var userId = GetUserId();
        var cart = await _cartService.GetCartAsync(userId);
        return Ok(cart);
    }

    // 2. API Thêm vào giỏ (Đã sửa lại truyền đúng 2 tham số)
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequestDto request)
    {
        var userId = GetUserId();
        await _cartService.AddToCartAsync(userId, request);

        return Ok(new { message = "Đã thêm sản phẩm vào giỏ hàng thực tế!" });
    }
    [HttpDelete("{productId}")]
    [Authorize]
    public async Task<IActionResult> RemoveFromCart(Guid productId)
    {
        // Lấy UserId từ Token giống như lúc AddToCart
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // Gọi Service để xóa item khỏi DB
        await _cartService.RemoveItemAsync(userId, productId);

        return Ok(new { message = "Đã xóa thành công" });
    }
}