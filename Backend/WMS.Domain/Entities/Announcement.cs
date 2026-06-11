namespace WMS.Domain.Entities;

public class Announcement
{
    public int AnnouncementId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public int CreatedBy { get; set; }

    public DateTime CreatedOn { get; set; } = DateTime.Now;

    public bool IsActive { get; set; } = true;
}