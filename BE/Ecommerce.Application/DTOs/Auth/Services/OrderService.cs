using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ecommerce.Application.DTOs.Order;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;



namespace Ecommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService; // <-- THAY BẰNG INTERFACE NÀY

    public OrderService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    // Lưu ý: Em đã đổi kiểu trả về từ IEnumerable<Order> sang IEnumerable<OrderHistoryDto>
    public async Task<IEnumerable<OrderHistoryDto>> GetAllOrdersAsync()
    {
        // 1. Kéo dữ liệu y hệt như cách sếp làm ở GetUserOrdersAsync
        var allOrders = await _unitOfWork.Repository<Domain.Entities.Order>().GetAllAsync();
        var allOrderItems = await _unitOfWork.Repository<Domain.Entities.OrderItem>().GetAllAsync();
        var allProducts = await _unitOfWork.Repository<Domain.Entities.Product>().GetAllAsync();
        var allUsers = await _unitOfWork.Repository<Domain.Entities.User>().GetAllAsync();

        // 2. Sắp xếp tất cả đơn hàng mới nhất lên đầu
        var sortedOrders = allOrders.OrderByDescending(o => o.CreatedAt).ToList();

        var result = new List<OrderHistoryDto>();

        // 3. Gom sản phẩm nhét vào từng đơn hàng
        foreach (var order in sortedOrders)
        {
            var items = allOrderItems
                .Where(i => i.OrderId == order.Id)
                .Select(i =>
                {
                    var product = allProducts.FirstOrDefault(p => p.Id == i.ProductId);
                    return new OrderItemHistoryDto
                    {
                        ProductName = product?.Name ?? "Sản phẩm không xác định",
                        Quantity = i.Quantity,
                        Price = product?.Price ?? i.UnitPrice
                    };
                }).ToList();

            var user = allUsers.FirstOrDefault(u => u.Id == order.UserId);

            result.Add(new OrderHistoryDto
            {
                Id = order.Id,
                OrderDate = order.CreatedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),

                // 2. KẾT NỐI VÀ TỰ ĐỘNG GÁN TÊN (Giả sử bảng User của sếp có cột UserName)
                CustomerName = user?.FullName ?? "Khách vãng lai",

                OrderItems = items
            });
        }
        return result;
    }

    public async Task DeleteOrderAsync(Guid id)
    {
        var orderRepo = _unitOfWork.Repository<Order>();
        var order = await orderRepo.GetByIdAsync(id); // Tìm đơn hàng theo ID

        if (order != null)
        {
            orderRepo.Remove(order); // Thường trong EF Core hàm xóa tên là Remove
            await _unitOfWork.SaveChangesAsync(); // Hàm lưu thường là SaveChangesAsync
        }
    }

    public async Task<IEnumerable<OrderHistoryDto>>GetUserOrdersAsync(Guid userId)
    {
        // 1. Lấy tất cả các bảng cần thiết
        var allOrders = await _unitOfWork.Repository<Domain.Entities.Order>().GetAllAsync();
        var allOrderItems = await _unitOfWork.Repository<Domain.Entities.OrderItem>().GetAllAsync();
        var allProducts = await _unitOfWork.Repository<Domain.Entities.Product>().GetAllAsync();

        // 2. Lọc ra đơn hàng của ông User này, sắp xếp đơn mới nhất lên đầu
        var myOrders = allOrders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToList();

        var result = new List<OrderHistoryDto>();

        // 3. Gom sản phẩm nhét vào từng đơn hàng
        foreach (var order in myOrders)
        {
            var items = allOrderItems
                .Where(i => i.OrderId == order.Id)
                .Select(i =>
                {
                    // Lấy thông tin sản phẩm gốc để móc Tên và Giá tiền
                    var product = allProducts.FirstOrDefault(p => p.Id == i.ProductId);

                    return new OrderItemHistoryDto
                    {
                        ProductName = product?.Name ?? "Sản phẩm không xác định",
                        Quantity = i.Quantity,
                        Price = product?.Price ?? 0 // Lấy giá từ bảng Product
                    };
                }).ToList();

            result.Add(new OrderHistoryDto
            {
                Id = order.Id,
                OrderDate = order.CreatedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(), // Chuyển Enum sang dạng chữ cho React dễ đọc
                OrderItems = items
            });
        }
        return result;
    }


    public async Task CheckoutAsync(Guid userId, CheckoutRequestDto request)
    {
        // 1. Tìm giỏ hàng của User
        var cart = (await _unitOfWork.Repository<Cart>().GetAllAsync()).FirstOrDefault(c => c.UserId == userId);
        if (cart == null) throw new Exception("Giỏ hàng của bạn đang trống!");

        // Lấy các món đồ trong giỏ
        var cartItems = (await _unitOfWork.Repository<CartItem>().GetAllAsync()).Where(ci => ci.CartId == cart.Id).ToList();
        if (!cartItems.Any()) throw new Exception("Chưa có sản phẩm nào để thanh toán!");

        // 2. Tính tổng tiền và check tồn kho
        decimal totalAmount = 0;
        var allProducts = await _unitOfWork.Repository<Product>().GetAllAsync();

        foreach (var item in cartItems)
        {
            var product = allProducts.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null) throw new Exception("Có sản phẩm không hợp lệ trong giỏ!");

            if (product.Stock < item.Quantity)
                throw new Exception($"Sản phẩm {product.Name} chỉ còn {product.Stock} cái, không đủ để đặt hàng!");

            totalAmount += product.Price * item.Quantity;
        }



        // 3. Tạo Đơn hàng (Order) kèm Địa chỉ giao hàng
        var order = new Domain.Entities.Order
        {
            UserId = userId,
            TotalAmount = totalAmount,
            Status = OrderStatus.Pending, // Đã trả về đúng kiểu Enum của sếp
            CreatedAt = DateTime.UtcNow,  // Giờ chuẩn UTC
            ShippingAddress = request.ShippingAddress,
            Note = request.Note
        };

        await _unitOfWork.Repository<Order>().AddAsync(order);
        await _unitOfWork.SaveChangesAsync(); // Lưu để lấy OrderId

        // 4. Chuyển đồ từ Giỏ sang Chi tiết đơn hàng (OrderItem) & Trừ kho
        foreach (var item in cartItems)
        {
            var product = allProducts.First(p => p.Id == item.ProductId);

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            };
            await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem);

            // Nghiệp vụ: Trừ tồn kho
            product.Stock -= item.Quantity;
            _unitOfWork.Repository<Product>().Update(product);

            // Nghiệp vụ: Dọn dẹp giỏ hàng (Xóa món đồ khỏi giỏ)
            item.IsDeleted = true; // Dùng cơ chế xóa mềm
            _unitOfWork.Repository<CartItem>().Update(item);
        }

        await _unitOfWork.SaveChangesAsync(); // Commit toàn bộ thay đổi xuống SQL

        await _notificationService.SendNotificationAsync(
            $"Ting ting! Có một đơn hàng mới trị giá {order.TotalAmount} vừa được đặt!");
    }


    public async Task UpdateOrderStatusAsync(Guid orderId, string status)
    {
        var order = await _unitOfWork.Repository<Domain.Entities.Order>().GetByIdAsync(orderId);
        if (order == null) throw new Exception("Không tìm thấy đơn hàng!");

        // Chuyển từ chữ (string) sang kiểu Enum OrderStatus của sếp
        if (Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            order.Status = parsedStatus;
            _unitOfWork.Repository<Domain.Entities.Order>().Update(order);
            await _unitOfWork.SaveChangesAsync();
        }
        else
        {
            throw new Exception("Trạng thái không hợp lệ!");
        }
    }

}
