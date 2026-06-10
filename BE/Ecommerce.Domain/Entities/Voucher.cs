using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Domain.Entities;

public class Voucher : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int UsageLimit { get; set; } // Giới hạn số lần sử dụng
    public int UsedCount { get; set; } = 0; // Đã dùng bao nhiêu lần
    public bool IsActive { get; set; } = true;
}
