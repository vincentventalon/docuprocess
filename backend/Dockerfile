# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for WeasyPrint, pdf2image, and curl for UV
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    curl \
    # Poppler for PDF to image conversion (pdf2image)
    poppler-utils \
    # Fonts for PDF generation - comprehensive font packages
    fontconfig \
    # Liberation (Arial, Times, Courier alternatives)
    fonts-liberation \
    fonts-liberation2 \
    # DejaVu
    fonts-dejavu \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    # FreeFonts
    fonts-freefont-ttf \
    fonts-freefont-otf \
    # Google Noto (comprehensive Unicode coverage)
    fonts-noto \
    fonts-noto-core \
    fonts-noto-mono \
    fonts-noto-ui-core \
    fonts-noto-color-emoji \
    # Popular web fonts
    fonts-roboto \
    fonts-roboto-slab \
    fonts-open-sans \
    fonts-lato \
    # fonts-inter removed - using self-hosted version for consistency with frontend
    # Monospace/Code fonts
    fonts-firacode \
    fonts-hack \
    fonts-inconsolata \
    fonts-jetbrains-mono \
    fonts-cascadia-code \
    fonts-fantasque-sans \
    # Icons
    fonts-font-awesome \
    fonts-material-design-icons-iconfont \
    # MS Office alternatives
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    # Other
    fonts-opensymbol \
    fonts-droid-fallback \
    fonts-comic-neue \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -f -v

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Copy dependency files for caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv sync (creates .venv)
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Install self-hosted fonts (same as frontend for consistent rendering)
RUN if [ -d "/app/fonts" ]; then \
    mkdir -p /usr/local/share/fonts/custom && \
    cp -r /app/fonts/* /usr/local/share/fonts/custom/ && \
    fc-cache -f -v; \
    fi

# Expose port (Cloud Run will set PORT env var, default to 8080)
EXPOSE 8080
ENV PORT=8080

# Use the virtual environment created by uv sync
ENV PATH="/app/.venv/bin:$PATH"

# Run the application (PORT is set by Cloud Run)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
