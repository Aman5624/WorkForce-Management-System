namespace WMS.Application.DTOs;

public class UpdateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public int RoleId { get; set; }

    public string Status { get; set; } = string.Empty;
}