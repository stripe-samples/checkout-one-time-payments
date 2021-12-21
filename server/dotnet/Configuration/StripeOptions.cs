using System.Collections.Generic;

public class StripeOptions
{
    public string PublishableKey { get; set; }
    public string SecretKey { get; set; }
    public string WebhookSecret { get; set; }
    public string Price { get; set; }
    public string Domain { get; set; }
}
