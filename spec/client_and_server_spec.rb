require 'stripe'

RSpec.describe "full integration path" do
  describe "/config" do
    it "returns the expected configuration" do
      # Get the index html page
      response = get("/")
      expect(response).not_to be_nil

      response = get_json("/config")
      expect(response).not_to be_nil
      expect(response).to have_key("publicKey")
      expect(response).to have_key("unitAmount")
      expect(response).to have_key("currency")
    end
  end

  describe "/create-checkout-session" do
    it "returns a redirect to the hosted checkout URL" do
      response = RestClient.post(
        "#{SERVER_URL}/create-checkout-session",
        {quantity: 7},
        {max_redirects: 0}
      )
      # RestClient will follow the redirect, but we can get the first response
      # from the server from the `history`.
      redirect_response = response.history.first

      # Asserts the right HTTP status code for the redirect
      expect(redirect_response.code).to eq(303)

      # Pull's the Checkout session ID out of the Location header
      # to assert the right configuration on the created session.
      redirect_url = redirect_response.headers[:location]
      expect(redirect_url).to start_with("https://checkout.stripe.com/c/pay/cs_test")
      match = redirect_url.match(".*(?<session_id>cs_test.*)#.*")
      session_id = match[:session_id]
      session = Stripe::Checkout::Session.retrieve({
        id: session_id,
        expand: ['line_items'],
      })
      expect(session.line_items.first.quantity).to eq(7)
    end
  end

  describe "/checkout-session" do
    it "Reretrieves the Checkout Session" do
      session = Stripe::Checkout::Session.create({
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        line_items: [{
          price: ENV['PRICE'],
          quantity: 1
        }],
        mode: 'payment',
      })

      resp = get_json("/checkout-session?sessionId=#{session.id}")
      expect(resp).to have_key('id')
      expect(resp).to have_key('object')
      expect(resp['object']).to eq('checkout.session')
    end
  end
end
