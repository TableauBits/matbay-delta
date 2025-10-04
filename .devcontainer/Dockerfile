FROM alpine:latest

# Global dependencies
RUN apk add --no-cache bash git curl nodejs libstdc++ sqlite openssh uv sudo

# Create a non-root user with matching UID/GID
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

RUN addgroup -g ${USER_GID} ${USERNAME} \
&& adduser -D -u ${USER_UID} -G ${USERNAME} ${USERNAME} \
&& echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME} \
&& chmod 0440 /etc/sudoers.d/${USERNAME}

# Set up SSH directory
RUN mkdir -p /home/${USERNAME}/.ssh \
&& chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.ssh \
&& chmod 700 /home/${USERNAME}/.ssh

USER ${USERNAME}

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/home/${USERNAME}/.bun/bin:$PATH"

# Frontend
RUN bun install -g @angular/cli