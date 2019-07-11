# Name of sample

## Requirements
* Maven
* Java
* [Configured .env file](../README.md)


1. Build the package
```
mvn package
```

2. Run the application
```
java -cp target/sales-tax-1.0.0-SNAPSHOT-jar-with-dependencies.jar com.stripe.sample.Server
```

3. Go to `localhost:4567` in your browser to see the demo