# Name of sample

## Requirements
* Maven
* Java

1. Build the jar
```
mvn package
```

2. Export environment variables
(the Java sample pulls environment variables from your system)

```
export STRIPE_PUBLIC_KEY=pk_replace_with_your_key
export STRIPE_SECRET_KEY=sk_replace_with_your_key
export STRIPE_WEBHOOK_SECRET=whsec_replace_with_your_key
```

3. Run the packaged jar
```
java -cp target/placing-a-hold-1.0.0-SNAPSHOT-jar-with-dependencies.jar com.stripe.sample.Server
```

4. Go to `localhost:4242` in your browser to see the demo
