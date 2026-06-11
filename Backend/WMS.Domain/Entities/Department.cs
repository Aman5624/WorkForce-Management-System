using System.Text.Json.Serialization;
namespace WMS.Domain.Entities;
public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.Now;

    [JsonIgnore]
    public ICollection<Employee>? Employees { get; set; }
}