# Architecture

## System Overview

```
┌───────────────────────────────────────────────────────────────┐
│                           Demo Client                         │
└───────────────┬───────────────────────────────────────────────┘
                │ HTTP /api/*
┌───────────────▼────────────────┐
│          API Gateway           │
│   (routing + request shaping)  │
└───────┬────────┬────────┬───────┘
        │        │        │
        ▼        ▼        ▼
┌────────────┐ ┌──────────────┐ ┌──────────────────┐
│ User Svc   │ │ Auth Svc     │ │ Payment Svc      │
└─────┬──────┘ └──────┬───────┘ └────────┬─────────┘
      │               │                  │
      ▼               ▼                  ▼
┌───────────────────────────────────────────────────────────────┐
│          In-Memory Data Store (users, payments, notes)         │
└───────────────────────────────────────────────────────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │ Notification │
                 │   Service    │
                 └──────────────┘
```

## Components

- **API Gateway**: Routes `/api/*` calls to the underlying demo microservices.
- **User Service**: CRUD-style user operations backed by the in-memory store.
- **Auth Service**: Registration + login over the same in-memory store.
- **Payment Service**: Records payments in-memory for fast demos.
- **Notification Service**: Emits in-memory notifications per user.

## Data Flow

1. A client calls the API gateway (`/api/users`, `/api/auth/*`, `/api/payments`).
2. The gateway forwards the request to the targeted service.
3. Each service mutates or reads the shared in-memory data store.
4. Responses are propagated back through the gateway.

## Optional Observability

The demo cluster includes opt-in observability building blocks:

- **Structured logs**: `ENABLE_STRUCTURED_LOGS=1` or `LOG_FORMAT=json`
- **Latency metrics**: `ENABLE_METRICS=1` (with optional `ENABLE_METRICS_ENDPOINT=1`)
- **Health checks**: `ENABLE_HEALTH_ENDPOINT=1`
- **OpenTelemetry scaffolding**: `ENABLE_OTEL=1` (no exporters configured)

These features are intentionally disabled by default to avoid changing baseline behavior.
