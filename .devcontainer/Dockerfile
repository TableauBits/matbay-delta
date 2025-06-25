FROM alpine:latest

# Global dependencies
RUN apk add --no-cache bash git curl nodejs libstdc++

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Frontend
RUN bun install -g @angular/cli