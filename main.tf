terraform {
  required_providers {
    stripe = {
      source  = "stripe/stripe"
      version = "0.1.3"
    }
  }
}

variable "stripe_api_key" {
  description = "Stripe API key (set via TF_VAR_stripe_api_key env var)"
  type        = string
  sensitive   = true
}

provider "stripe" {
  api_key = var.stripe_api_key
}

variable "webhook_url" {
  description = "URL for Stripe webhook endpoint (e.g., https://your-server.com/webhook)"
  type        = string
  default     = ""
}

# Product
resource "stripe_product" "sample_product" {
  name        = "Sample Product"
  description = "A sample product for one-time checkout payments"
}

# Price - $5.00 USD one-time payment (matches README example)
resource "stripe_price" "sample_price" {
  product     = stripe_product.sample_product.id
  currency    = "usd"
  unit_amount = 500
}

# Webhook endpoint (only created if webhook_url is provided)
resource "stripe_webhook_endpoint" "webhook" {
  count = var.webhook_url != "" ? 1 : 0

  url = var.webhook_url
  enabled_events = [
    "checkout.session.completed",
  ]
}

# Outputs
output "product_id" {
  description = "The ID of the created product"
  value       = stripe_product.sample_product.id
}

output "price_id" {
  description = "The ID of the created price (use this for PRICE env var)"
  value       = stripe_price.sample_price.id
}

output "webhook_endpoint_id" {
  description = "The ID of the webhook endpoint (if created)"
  value       = var.webhook_url != "" ? stripe_webhook_endpoint.webhook[0].id : null
}
