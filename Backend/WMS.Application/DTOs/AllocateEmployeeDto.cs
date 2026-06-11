namespace WMS.Application.DTOs;

public class AllocateEmployeeDto
{
    public int EmpId { get; set; }

    public int ProjectId { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
}