# Notification System Design

This repository is initialized for a backend-only notification service evaluation.

## Stage 0 scope
- `logging_middleware/` holds the future logging transport and validation components.
- `vehicle_maintenance_scheduler/` holds the future scheduler algorithm.
- `notification_app_be/` contains the Express application and environment config.
- `.env` stores runtime variables for the backend.

## Current architecture
- Express app serves as the primary entrypoint.
- Environment configuration is centralized in `notification_app_be/src/config/env.ts`.
- Health check route is available at `/health`.

## Next steps
- Implement the logging middleware in `logging_middleware/`.
- Add scheduler logic in `vehicle_maintenance_scheduler/`.
- Expand API routes and controllers inside `notification_app_be/`.
