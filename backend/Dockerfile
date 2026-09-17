FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --home /app --gecos "" appuser \
    && chown -R appuser:appuser /app
ENV HOME=/app
USER appuser

EXPOSE 8000

# $PORT is injected by hosts like Render; defaults to 8000 for local `docker run`.
# Runs collectstatic + migrate on every boot so a fresh deploy is always in sync.
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
