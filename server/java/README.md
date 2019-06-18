# Name of recipe

## Requirements
* Maven
* Java
* [Configured .env file](../README.md)


1. Build the jar
```
mvn package
```

2. Run the packaged jar
```
java -cp target/some-recipe-1.0.0-SNAPSHOT-jar-with-dependencies.jar com.stripe.recipe.Server
```

Go to http://localhost:4567/