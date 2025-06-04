# Use the latest Ubuntu LTS as the base image
FROM ubuntu:latest

# Set environment variables to prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Update package lists and install essential packages and Python/Node dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common \
    curl \
    wget \
    gnupg \
    build-essential \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.13
RUN add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.13 \
    python3.13-venv \
    python3.13-dev \
    python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Update alternatives to make python3.13 the default python and python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.13 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.13 1

# Ensure pip for Python 3.13 is used and upgrade it
# Use --ignore-installed to bypass debian pip conflicts
RUN python3 -m pip install --upgrade --ignore-installed --break-system-packages pip

# Install Node.js 22.x and npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user 'ubuntu' with sudo privileges (check if exists first)
RUN id -u ubuntu &>/dev/null || useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Switch to the non-root user
USER ubuntu

# Set the working directory to the user's home directory
WORKDIR /home/ubuntu

# Verify installations (this CMD will be overridden by Cursor agent's startup)
CMD ["sh", "-c", "echo 'Python version:'; python --version; echo 'pip version:'; pip --version; echo 'Node.js version:'; node --version; echo 'npm version:'; npm --version"]