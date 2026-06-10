using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public Guid CategoryId { get; set; }

    // Relationships
    public Category Category { get; set; } = null!;
    public int Stock { get; set; }
    // Thêm Khóa ngoại trỏ về Dòng sản phẩm (Có dấu ? vì có thể null đối với linh kiện không có series)
    public Guid? SeriesId { get; set; }

    // Navigation property
    public ProductSeries? Series { get; set; }
}
