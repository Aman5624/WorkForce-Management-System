using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs;

public class CreateEmployeeDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public char Gender { get; set; }

    public DateTime DOB { get; set; }

    public DateTime DOJ { get; set; }

    public int DepartmentId { get; set; }

    public int RoleId { get; set; }
}