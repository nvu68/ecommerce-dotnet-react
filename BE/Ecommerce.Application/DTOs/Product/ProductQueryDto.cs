using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Product;

public class ProductQueryDto
{
    public string? SearchTerm { get; set; } // Từ khóa tìm kiếm (Ví dụ: "Laptop")
    public Guid? CategoryId { get; set; }   // Lọc theo Danh mục
    public int PageNumber { get; set; } = 1; // Mặc định ở trang 1
    public int PageSize { get; set; } = 10;  // Mặc định lấy 10 sản phẩm/trang
}
