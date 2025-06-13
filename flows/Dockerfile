FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir langflow==0.5.3 python-dotenv

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 7860

# Start LangFlow
CMD ["langflow", "run", "--host", "0.0.0.0", "--port", "7860"] 