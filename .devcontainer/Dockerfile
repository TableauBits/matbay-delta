FROM node:24-alpine

# Global dependencies
RUN apk add --no-cache bash git curl

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Frontend
RUN bun install -g @angular/cli