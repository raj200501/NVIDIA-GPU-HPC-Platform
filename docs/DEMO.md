# Demo Guide

## 60-Second Demo

```bash
npm start
```

In another terminal:

```bash
npm test
```

## Optional Demo Mode (Temp Workspace)

The demo mode script runs the same flow but writes a summary file into a temporary directory:

```bash
npm run demo:mode
```

The output prints a path like `/tmp/nvidia-gpu-hpc-demo-XXXX/demo-summary.json` with the captured responses.

## Optional Observability (Disabled by Default)

Enable structured logs, metrics, and health checks without changing core behavior:

```bash
ENABLE_STRUCTURED_LOGS=1 ENABLE_METRICS=1 ENABLE_METRICS_ENDPOINT=1 ENABLE_HEALTH_ENDPOINT=1 npm start
```

Then visit:

- `http://localhost:3000/health`
- `http://localhost:3000/metrics`
