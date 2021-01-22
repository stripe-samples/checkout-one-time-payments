require 'stripe'

RSpec.describe "full integration path" do
  it "just works" do
    # Get the index html page
    response = get("/")
    expect(response).not_to be_nil

    response = get_json("/config")
    expect(response).not_to be_nil
    expect(response).to have_key("publicKey")
    expect(response).to have_key("unitAmount")
    expect(response).to have_key("currency")

    response, status = post_json("/create-checkout-session", {'quantity': 2, 'locale': 'en'})
    expect(status).to eq(200)
    expect(response).not_to be_nil
    expect(response).to have_key('sessionId')

    session = Stripe::Checkout::Session.retrieve(response['sessionId'])
    expect(session.payment_method_types).to include('card')
    expect(session.payment_method_types).to include('ideal')

    resp = get_json("/checkout-session?sessionId=#{response['sessionId']}")
    expect(resp).to have_key('id')
    expect(resp).to have_key('object')
    expect(resp['object']).to eq('checkout.session')
  end
end
