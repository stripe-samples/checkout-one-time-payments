require 'stripe'
require 'sinatra'
require 'dotenv'

Dotenv.load(File.dirname(__FILE__) + '/../../.env.example')
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), '../../client/')

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

post '/' do
  content_type 'application/json'
  data = JSON.parse request.body.data

  {
    data: data
  }.to_json
end
