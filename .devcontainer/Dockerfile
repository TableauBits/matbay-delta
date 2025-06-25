FROM alpine:latest

# Global dependencies
RUN apk add --no-cache bash git curl nodejs libstdc++

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Frontend
RUN bun install -g @angular/cli