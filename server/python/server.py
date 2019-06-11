#! /usr/bin/env python3.6

"""
server.py
Stripe Recipe.
Python 3.6 or newer required.
"""

import stripe
import json
import os

from flask import Flask, render_template, jsonify, request, send_from_directory
from dotenv import load_dotenv, find_dotenv

static_dir = f'{os.path.abspath(os.path.join(__file__ ,"../../../client"))}'
app = Flask(__name__, static_folder=static_dir, template_folder=static_dir)

# Setup Stripe python client library
load_dotenv(find_dotenv())
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe.api_version = os.getenv('STRIPE_API_VERSION')

@app.route('/', methods=['GET'])
def get_example():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def post_example():
    # Reads application/json and returns a response
    data = json.loads(request.data)
    try:
        return jsonify({'data': data})
    except Exception as e:
        return jsonify(e), 403

if __name__== '__main__':
    app.run()
