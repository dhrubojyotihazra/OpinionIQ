FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend /app/

# Expose port
EXPOSE 5000

# Run gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
