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

## Database design

### Choice and justification

PostgreSQL is the recommended primary storage for notifications because it supports:
- strong relational consistency for delivery status updates, read receipts, and deduplication;
- efficient indexing on recipient and timestamp fields;
- predictable query semantics for large notification fetches;
- partitioning and archive strategies for high-scale retention.

The schema is intentionally focused and extensible, with a single notification table that can be extended with metadata or JSONB payloads later.

### Notification schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ NULL,
  payload JSONB NULL
);

CREATE INDEX idx_notifications_recipient_created_at
  ON notifications (recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_is_read_created_at
  ON notifications (recipient_id, is_read, created_at DESC);
```

### Example queries

- Insert a notification:

```sql
INSERT INTO notifications (recipient_id, title, body, payload)
VALUES ($1, $2, $3, $4::jsonb)
RETURNING id, recipient_id, title, body, created_at;
```

- Fetch unread notifications for a recipient, newest first:

```sql
SELECT id, recipient_id, title, body, is_read, created_at
FROM notifications
WHERE recipient_id = $1
  AND is_read = false
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

- Mark a notification as read:

```sql
UPDATE notifications
SET is_read = true,
    updated_at = now()
WHERE id = $1
RETURNING id, is_read, updated_at;
```

### Large-scale handling

- Use keyset pagination for stable scroll behavior when recipients have large inboxes.
- Partition the table by `recipient_id` or `created_at` when message volume grows beyond tens of millions of rows.
- Archive old notifications to a secondary store or cold table to keep active indexes compact.
- Maintain a write-optimized insertion path and avoid full-table scans by querying only the recipient-specific indexes.
- Optionally add a `notification_status` field for multi-step delivery states without changing the core schema.

### Notes

- This design avoids a generic `notification_events` event store and keeps per-recipient lookup performant.
- If a NoSQL alternative is desired later, use a document store with a collection keyed by `recipientId` and sorted notification arrays, but the current schema is optimized for relational access patterns.
