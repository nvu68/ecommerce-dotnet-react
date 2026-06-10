using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Ecommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        // 1. Kéo dữ liệu từ Database lên
        var orders = await _unitOfWork.Repository<Order>().GetAllAsync();
        var products = await _unitOfWork.Repository<Product>().GetAllAsync();

        // 2. Tính toán tiền nong (Bỏ qua những đơn có trạng thái Cancelled - Đã hủy)
        var validOrders = orders.Where(o => o.Status != Ecommerce.Domain.Enums.OrderStatus.Cancelled).ToList();

        var totalRevenue = validOrders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count();
        var totalProducts = products.Count();

        // 3. Đóng gói gửi về cho màn hình React
        return Ok(new
        {
            totalRevenue = totalRevenue,
            totalOrders = totalOrders,
            totalProducts = totalProducts
        });
    }
}