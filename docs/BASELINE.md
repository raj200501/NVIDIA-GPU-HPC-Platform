# Baseline Verification Report

Date: 2025-09-17

## Commands Run

```bash
npm test
```

## Results Summary

- ✅ `npm test` completed successfully (runs `scripts/smoke_test.js`).
- Note: `npm` emitted a warning about an unknown `http-proxy` config in this environment; it did not affect execution.

## Output Snapshot

```
> nvidia-gpu-hpc-platform@1.0.0 test
> node scripts/smoke_test.js

User service running on port 8080
Auth service running on port 8081
Payment service running on port 8082
Notification service running on port 8083
API Gateway is running on port 3000
...
Smoke test completed successfully.
```

Date (observed in environment): 2026-01-21
