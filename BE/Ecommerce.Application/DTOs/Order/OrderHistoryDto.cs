using System;
using System.Collections.Generic;

namespace Ecommerce.Application.DTOs.Order;

public class OrderHistoryDto
{
    public Guid Id { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string CustomerName { get; set; }
    public List<OrderItemHistoryDto> OrderItems { get; set; } = new List<OrderItemHistoryDto>();
}

public class OrderItemHistoryDto
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}