using Ecommerce.Application.DTOs.Order;
using Ecommerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.Interfaces;

public interface IOrderService
{
    // Thêm dòng này vào danh sách các hàm
    Task<IEnumerable<OrderHistoryDto>> GetAllOrdersAsync();
    Task DeleteOrderAsync(Guid id);
    Task<IEnumerable<OrderHistoryDto>> GetUserOrdersAsync(Guid userId);
    Task CheckoutAsync(Guid userId, CheckoutRequestDto request);
    Task UpdateOrderStatusAsync(Guid orderId, string status);
}   
