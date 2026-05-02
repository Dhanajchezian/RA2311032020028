# Notification System Design

This document describes the backend notification service architecture, API contracts, and high-level real-time delivery strategy.

## REST API endpoints

- `POST /api/notifications`
  - Description: create a new notification for a recipient.
  - Behavior: validates payload, applies business rules, persists the notification, and enqueues delivery metadata.

- `GET /api/notifications`
  - Description: fetch notifications by recipient or status.
  - Query parameters: `recipientId`, `isRead`, `limit`, `offset`.

- `GET /api/notifications/:id`
  - Description: retrieve a single notification by its identifier.

- `PUT /api/notifications/:id/read`
  - Description: mark a notification as read.

- `GET /health`
  - Description: basic service health check.

## Request / response schemas

### Notification creation request
```json
{
  "recipientId": "string",
  "title": "string",
  "body": "string"
}
```

### Notification creation response
```json
{
  "status": "success",
  "message": "Notification queued",
  "data": {
    "id": "string",
    "recipientId": "string",
    "title": "string",
    "body": "string",
    "createdAt": "string"
  },
  "requestId": "string"
}
```

### Fetch notifications response
```json
{
  "status": "success",
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "string",
      "recipientId": "string",
      "title": "string",
      "body": "string",
      "isRead": true,
      "createdAt": "string"
    }
  ],
  "requestId": "string"
}
```

## Headers and metadata

- `Content-Type: application/json`
- `X-Request-ID: <uuid>` (optional client-provided correlation ID)
- `Accept: application/json`
- Logging integration points capture headers and requestId for traceability.

## Naming conventions

- API endpoints use kebab-case paths and nouns: `/api/notifications`, `/api/notifications/:id/read`.
- JSON payload fields use camelCase: `recipientId`, `createdAt`, `isRead`.
- Internal layers use explicit package names for logs: `route`, `controller`, `service`, `repository`, `middleware`, `handler`.
- Response wrapper standardizes `status`, `message`, `data`, and `requestId`.

## Real-time strategy (high-level)

- Backend publishes notification events to a delivery pipeline after persistence.
- Primary delivery path: push notification metadata to a message broker or socket gateway.
- Secondary fallback: client polling with `GET /api/notifications?recipientId=...&isRead=false`.
- Real-time freshness is achieved by keeping the backend stateless and emitting events from the notification service layer.
- Logs track event publication attempts and failures so delivery issues can be diagnosed without impacting core request flow.
