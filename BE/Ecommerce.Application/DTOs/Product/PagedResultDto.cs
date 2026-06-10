using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Application.DTOs.Product;

public class PagedResultDto<T>
{
    public int TotalItems { get; set; } // Tổng số sản phẩm trong kho
    public int TotalPages { get; set; } // Tổng số trang
    public IEnumerable<T> Items { get; set; } = new List<T>(); // Danh sách sản phẩm của trang hiện tại
}
