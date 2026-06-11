using System.Text.Json.Serialization;
namespace WMS.Domain.Entities;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    [JsonIgnore]
    public ICollection<Employee>? Employees { get; set; }
}