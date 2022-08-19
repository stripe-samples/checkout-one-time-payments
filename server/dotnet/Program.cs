using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

DotNetEnv.Env.Load();

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

StripeConfiguration.AppInfo = new AppInfo
{
    Name = "stripe-samples/checkout-one-time-payments",
    Url = "https://github.com/stripe-samples/checkout-one-time-payments",
    Version = "0.1.0",
};

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = Environment.GetEnvironmentVariable("STATIC_DIR")
});

builder.Services.Configure<StripeOptions>(options =>
{
    options.PublishableKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY");
    options.SecretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
    options.WebhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
    options.Price = Environment.GetEnvironmentVariable("PRICE");
    options.Domain = Environment.GetEnvironmentVariable("DOMAIN");
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/config", async (IOptions<StripeOptions> stripeOptions) =>
{
    var priceService = new PriceService();
    var price = await priceService.GetAsync(stripeOptions.Value.Price);

    return Results.Ok(new
    {
        publicKey = stripeOptions.Value.PublishableKey,
        UnitAmount = price.UnitAmount,
        Currency = price.Currency,
    });
});

app.MapGet("/checkout-session", async (string sessionId) =>
{
    var service = new SessionService();
    var session = await service.GetAsync(sessionId);
    return session;
});

app.MapPost("/create-checkout-session", async (IOptions<StripeOptions> stripeOptions, HttpContext context) =>
{
    var options = new SessionCreateOptions
    {
        SuccessUrl = $"{stripeOptions.Value.Domain}/success.html?session_id={{CHECKOUT_SESSION_ID}}",
        CancelUrl = $"{stripeOptions.Value.Domain}/canceled.html",
        Mode = "payment",
        LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = long.Parse(context.Request.Form["quantity"]),
                        Price = stripeOptions.Value.Price,
                    },
                },
    };

    var service = new SessionService();
    var session = await service.CreateAsync(options);
    return Results.Redirect(session.Url);
});

app.MapPost("webhook", async (IOptions<StripeOptions> stripeOptions, HttpContext context) =>
{
    var payload = await new StreamReader(context.Request.Body).ReadToEndAsync();
    Event stripeEvent;
    try
    {
        stripeEvent = EventUtility.ConstructEvent(
            payload,
            context.Request.Headers["Stripe-Signature"],
            stripeOptions.Value.WebhookSecret, throwOnApiVersionMismatch: false
        );

        app.Logger.LogInformation($"Webhook notification with type: {stripeEvent.Type} found for {stripeEvent.Id}");
    }
    catch (Exception e)
    {
        app.Logger.LogError(e, $"Something failed");
        return Results.BadRequest();
    }

    if (stripeEvent.Type == "checkout.session.completed")
    {
        var session = stripeEvent.Data.Object as Session;
        app.Logger.LogInformation($"Session ID: {session.Id}");

        // Take some action based on session.
    }

    return Results.Ok();
});

app.Run();
