using Newtonsoft.Json;

public class CreateCheckoutSessionRequest
{
    [JsonProperty("quantity")]
    public long Quantity { get; set; }
}