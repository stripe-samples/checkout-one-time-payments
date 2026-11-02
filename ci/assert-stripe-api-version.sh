#!/usr/bin/env bash
# Asserts that the Stripe SDK installed for a server pins the expected API version.
#
# Usage: ci/assert-stripe-api-version.sh <server_type> [expected_version]
#
# Run from the server's directory (e.g. server/node) after its dependencies are
# installed/built. The expected version defaults to $EXPECTED_STRIPE_API_VERSION.
set -euo pipefail

server_type=${1:?usage: $0 <server_type> [expected_version]}
expected=${2:-${EXPECTED_STRIPE_API_VERSION:?set EXPECTED_STRIPE_API_VERSION or pass it as an argument}}

case "$server_type" in
  node|nextjs)
    output=$(node -p "require('stripe')('sk_test_x').getApiField('version')")
    ;;
  python)
    output=$(python -c "import stripe; print(stripe.api_version)")
    ;;
  ruby)
    output=$(bundle exec ruby -e 'require "stripe"; puts Stripe::ApiVersion::CURRENT')
    ;;
  php)
    output=$(php -r 'require "vendor/autoload.php"; echo \Stripe\Util\ApiVersion::CURRENT;')
    ;;
  go)
    module=$(go list -m -f '{{.Path}}' all | grep '^github.com/stripe/stripe-go/')
    output=$(go doc "$module" APIVersion)
    ;;
  java)
    output=$(javap -constants -cp target/sample-jar-with-dependencies.jar com.stripe.ApiVersion)
    ;;
  dotnet)
    # The version is a const string compiled into Stripe.net.dll as UTF-16.
    framework=$(sed -n 's:.*<TargetFramework>\(.*\)</TargetFramework>.*:\1:p' *.csproj)
    dll=$(find bin -path "*/$framework/Stripe.net.dll" | head -1)
    output=$(LC_ALL=C tr -d '\0' < "$dll")
    ;;
  *)
    echo "Unknown server type: $server_type" >&2
    exit 1
    ;;
esac

actual=$(echo "$output" | LC_ALL=C grep -ao '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]\.[a-z]*' | head -1 || true)

echo "Stripe API version ($server_type): ${actual:-<not found>}"
if [[ "$actual" != "$expected" ]]; then
  echo "Expected Stripe API version $expected" >&2
  exit 1
fi
