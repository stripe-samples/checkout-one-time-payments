using Newtonsoft.Json;

public class CreateCheckoutSessionResponse
{
    [JsonProperty("sessionId")]
    public string SessionId { get; set; }
}