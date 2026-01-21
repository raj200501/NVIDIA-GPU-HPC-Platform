# Security Overview

## Threat Model

This repository ships a local-only demo stack. The primary risks are:

- Accidental exposure of demo services on unintended network interfaces.
- Insecure handling of test credentials in logs or files.
- Unintended dependency updates that reach out to external services.

## Safe Defaults

- Services bind to `localhost` by default and run in-memory only.
- No telemetry or exporters are enabled by default.
- No secrets, API keys, or tokens are stored in this repository.

## Intentional Restrictions

- No network calls are required for tests (aside from localhost HTTP).
- Demo mode writes only to temporary directories.
- Optional observability is opt-in via explicit flags.

## Reporting

If you discover a security issue, please open a GitHub issue with steps to reproduce and a suggested mitigation.
