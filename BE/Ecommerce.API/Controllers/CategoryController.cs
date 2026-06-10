using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Ecommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        // Gọi thẳng qua UnitOfWork giống hệt cách sếp làm ở hàm Create
        var categories = await _unitOfWork.Repository<Category>().GetAllAsync();
        return Ok(categories.OrderBy(c => c.Name).ToList());
    }

    // =========================================================================
    // 🔥 API MỚI: TRẢ VỀ DỮ LIỆU ĐỘNG CHO MEGA MENU (DANH MỤC -> HÃNG -> DÒNG)
    // =========================================================================
    [HttpGet("MegaMenu")]
    public async Task<IActionResult> GetMegaMenu()
    {
        // 1. Lấy dữ liệu từ 3 bảng (Vì số lượng ít nên lấy hết cực nhanh)
        var categories = await _unitOfWork.Repository<Category>().GetAllAsync();
        var brands = await _unitOfWork.Repository<Brand>().GetAllAsync();
        var seriesList = await _unitOfWork.Repository<ProductSeries>().GetAllAsync();

        // 2. Chế biến thành cấu trúc JSON cha con lồng nhau bằng LINQ
        var megaMenu = categories.Select(cat => new
        {
            Id = cat.Id,
            Name = cat.Name,

            // Tìm tất cả Dòng sản phẩm thuộc Danh mục này, sau đó GOM NHÓM theo Hãng (Brand)
            Brands = seriesList
                .Where(s => s.CategoryId == cat.Id)
                .GroupBy(s => s.BrandId)
                .Select(group => new
                {
                    BrandId = group.Key,
                    // Tìm tên Hãng tương ứng với ID
                    BrandName = brands.FirstOrDefault(b => b.Id == group.Key)?.Name ?? "Khác",

                    // Danh sách các Dòng máy thuộc Hãng đó
                    Series = group.Select(s => new
                    {
                        Id = s.Id,
                        Name = s.Name
                    }).OrderBy(s => s.Name).ToList()
                })
                .OrderBy(b => b.BrandName)
                .ToList()
        }).OrderBy(c => c.Name).ToList();

        return Ok(megaMenu);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string name)
    {
        var category = new Category
        {
            Name = name,
            Description = "Danh mục tạo tự động để test"
        };

        await _unitOfWork.Repository<Category>().AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return Ok(category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CategoryUpdateDto request)
    {
        // 1. Tìm danh mục trong Database
        var categories = await _unitOfWork.Repository<Category>().GetAllAsync();
        var category = categories.FirstOrDefault(c => c.Id == id);

        if (category == null)
        {
            return NotFound("Không tìm thấy danh mục này!");
        }

        // 2. Cập nhật tên mới từ React gửi lên
        category.Name = request.Name;

        // 3. Lưu lại vào SQL Server (EF Core sẽ tự động tracking thay đổi)
        await _unitOfWork.SaveChangesAsync();

        return Ok(category);
    }

    public class CategoryUpdateDto
    {
        public string Name { get; set; }
    }
}