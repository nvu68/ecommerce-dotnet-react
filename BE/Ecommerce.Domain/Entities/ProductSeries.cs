using System;
using System.Collections.Generic;

namespace Ecommerce.Domain.Entities
{
    public class ProductSeries : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        // Khóa ngoại trỏ về bảng Brands và Categories
        public Guid BrandId { get; set; }
        public Guid CategoryId { get; set; }

        // Navigation properties
        public Brand Brand { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}