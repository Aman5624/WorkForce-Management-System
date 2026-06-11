namespace WMS.Application.DTOs;

public class ApplyLeaveDto
{
    public int EmpId { get; set; }

    public string LeaveType { get; set; } = string.Empty;

    public string? Reason { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }
}