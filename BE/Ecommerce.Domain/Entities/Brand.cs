using System;
using System.Collections.Generic;

namespace Ecommerce.Domain.Entities
{
    public class Brand : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }

        // Navigation property để EF Core hiểu 1 Hãng có nhiều Dòng sản phẩm
        public ICollection<ProductSeries> ProductSeries { get; set; } = new List<ProductSeries>();
    }
}