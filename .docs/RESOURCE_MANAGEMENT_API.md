# Admin Resource Catalogue - API Testing Guide

This guide covers testing the Resource Catalogue Management API for Smart Campus. All endpoints require ADMIN role authorization.

## Base URL
```
http://localhost:8080/api/admin/resources
```

## Authentication
All endpoints require Bearer token in the Authorization header.
Get token by logging in as admin user, then use it in subsequent requests.

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new resource |
| GET | `/` | Get all active resources |
| GET | `/{id}` | Get resource by ID |
| GET | `/type/{type}` | Get resources by type |
| GET | `/location/{location}` | Get resources by location |
| GET | `/status/{status}` | Get resources by status |
| PUT | `/{id}` | Update resource metadata |
| PATCH | `/{id}/status` | Update only resource status |
| DELETE | `/{id}` | Soft delete (archive) resource |
| PATCH | `/{id}/restore` | Restore archived resource |

---

## 1. CREATE RESOURCE

**Request:**
```bash
curl -X POST http://localhost:8080/api/admin/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A101",
    "description": "Main lecture hall with 150 seats",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A, Floor 1",
    "availabilityWindows": [
      {
        "dayOfWeek": "MONDAY",
        "startTime": "09:00:00",
        "endTime": "17:00:00"
      },
      {
        "dayOfWeek": "TUESDAY",
        "startTime": "09:00:00",
        "endTime": "17:00:00"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lecture Hall A101",
  "description": "Main lecture hall with 150 seats",
  "type": "LECTURE_HALL",
  "capacity": 150,
  "location": "Building A, Floor 1",
  "status": "ACTIVE",
  "availabilityWindows": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "TUESDAY",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    }
  ],
  "archived": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 2. CREATE RESOURCE (Minimal - Only Required Fields)

**Request:**
```bash
curl -X POST http://localhost:8080/api/admin/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lab Equipment Set 1",
    "type": "EQUIPMENT",
    "location": "Science Building, Basement"
  }'
```

---

## 3. GET ALL RESOURCES

**Request:**
```bash
curl -X GET http://localhost:8080/api/admin/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Lecture Hall A101",
    "type": "LECTURE_HALL",
    "status": "ACTIVE",
    "location": "Building A, Floor 1",
    "capacity": 150,
    "archived": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Lab A02",
    "type": "LAB",
    "status": "ACTIVE",
    "location": "Building B, Floor 2",
    "capacity": 30,
    "archived": false,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
]
```

---

## 4. GET RESOURCE BY ID

**Request:**
```bash
curl -X GET http://localhost:8080/api/admin/resources/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lecture Hall A101",
  "description": "Main lecture hall with 150 seats",
  "type": "LECTURE_HALL",
  "capacity": 150,
  "location": "Building A, Floor 1",
  "status": "ACTIVE",
  "availabilityWindows": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    },
    {
      "dayOfWeek": "TUESDAY",
      "startTime": "09:00:00",
      "endTime": "17:00:00"
    }
  ],
  "archived": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 5. GET RESOURCES BY TYPE

**Request:**
```bash
curl -X GET http://localhost:8080/api/admin/resources/type/LECTURE_HALL \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
List of all resources with type = LECTURE_HALL

---

## 6. GET RESOURCES BY LOCATION

**Request:**
```bash
curl -X GET 'http://localhost:8080/api/admin/resources/location/Building%20A,%20Floor%201' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
List of all resources at the specified location

---

## 7. GET RESOURCES BY STATUS

**Request:**
```bash
curl -X GET http://localhost:8080/api/admin/resources/status/ACTIVE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
List of all resources with ACTIVE status

**Possible Status Values:**
- `ACTIVE` - Resource is available for booking
- `OUT_OF_SERVICE` - Resource is temporarily unavailable

---

## 8. UPDATE RESOURCE (Full Update)

**Request:**
Update multiple fields of a resource:

```bash
curl -X PUT http://localhost:8080/api/admin/resources/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A101 (Updated)",
    "description": "Main lecture hall with 160 seats - expanded",
    "capacity": 160,
    "status": "ACTIVE",
    "availabilityWindows": [
      {
        "dayOfWeek": "MONDAY",
        "startTime": "08:00:00",
        "endTime": "18:00:00"
      },
      {
        "dayOfWeek": "WEDNESDAY",
        "startTime": "08:00:00",
        "endTime": "18:00:00"
      },
      {
        "dayOfWeek": "FRIDAY",
        "startTime": "08:00:00",
        "endTime": "18:00:00"
      }
    ]
  }'
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lecture Hall A101 (Updated)",
  "description": "Main lecture hall with 160 seats - expanded",
  "type": "LECTURE_HALL",
  "capacity": 160,
  "location": "Building A, Floor 1",
  "status": "ACTIVE",
  "availabilityWindows": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "08:00:00",
      "endTime": "18:00:00"
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "startTime": "08:00:00",
      "endTime": "18:00:00"
    },
    {
      "dayOfWeek": "FRIDAY",
      "startTime": "08:00:00",
      "endTime": "18:00:00"
    }
  ],
  "archived": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:22:00Z"
}
```

---

## 9. UPDATE ONLY RESOURCE STATUS

**Request:**
```bash
curl -X PATCH 'http://localhost:8080/api/admin/resources/507f1f77bcf86cd799439011/status?status=OUT_OF_SERVICE' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lecture Hall A101",
  "status": "OUT_OF_SERVICE",
  "location": "Building A, Floor 1",
  "capacity": 150,
  "archived": false,
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

**Status Values:**
- `ACTIVE` - Resource available for booking
- `OUT_OF_SERVICE` - Resource temporarily unavailable (maintenance, etc.)

---

## 10. SOFT DELETE (Archive) RESOURCE

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/admin/resources/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (204 No Content):**
Resource is marked as archived and will not appear in normal queries.

---

## 11. RESTORE ARCHIVED RESOURCE

**Request:**
```bash
curl -X PATCH http://localhost:8080/api/admin/resources/507f1f77bcf86cd799439011/restore \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Lecture Hall A101",
  "status": "ACTIVE",
  "location": "Building A, Floor 1",
  "capacity": 150,
  "archived": false,
  "updatedAt": "2024-01-15T14:35:00Z"
}
```

---

## Common Resource Types

Suggested resource types for typical campus environments:
- `LECTURE_HALL` - Classroom with lecture-style seating
- `LAB` - Laboratory with equipment and workstations
- `MEETING_ROOM` - Conference/meeting spaces
- `EQUIPMENT` - Movable equipment (projectors, cameras, etc.)
- `LIBRARY` - Library spaces
- `COMPUTER_LAB` - Computer lab with workstations
- `SEMINAR_ROOM` - Seminar/discussion spaces
- `AUDITORIUM` - Large gathering spaces
- `PARKING` - Parking facilities
- `SPORTS_FACILITY` - Sports equipment/spaces

---

## Error Responses

### 400 Bad Request - Duplicate Resource Name
```json
{
  "error": "A resource with this name already exists."
}
```

### 400 Bad Request - Invalid Capacity
```json
{
  "error": "Capacity must be at least 1 if provided."
}
```

### 404 Not Found - Resource Not Found
```json
{
  "error": "Resource not found."
}
```

### 401 Unauthorized - Missing or Invalid Token
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden - Non-Admin User
```json
{
  "error": "Access Denied"
}
```

---

## Testing Workflow

### Step 1: Login as Admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@campus.edu",
    "password": "admin123456"
  }'
```

Save the returned JWT token.

### Step 2: Create Multiple Resources
Create resources with different types and locations for testing.

### Step 3: List Resources
Verify all resources appear in the list.

### Step 4: Get by Type / Location / Status
Test filtering endpoints.

### Step 5: Update Resources
Modify availability, status, and other metadata.

### Step 6: Archive and Restore
Test soft delete and restore functionality.

---

## Example Complete Workflow

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@campus.edu",
    "password": "admin123456"
  }' | jq -r '.token')

# 2. Create lecture hall
RESOURCE_ID=$(curl -s -X POST http://localhost:8080/api/admin/resources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A101",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A, Floor 1"
  }' | jq -r '.id')

# 3. Get the resource
curl -s -X GET http://localhost:8080/api/admin/resources/$RESOURCE_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Update status to OUT_OF_SERVICE
curl -s -X PATCH "http://localhost:8080/api/admin/resources/$RESOURCE_ID/status?status=OUT_OF_SERVICE" \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Archive the resource
curl -s -X DELETE http://localhost:8080/api/admin/resources/$RESOURCE_ID \
  -H "Authorization: Bearer $TOKEN"

# 6. Restore the resource
curl -s -X PATCH http://localhost:8080/api/admin/resources/$RESOURCE_ID/restore \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Postman Collection

You can import this as a Postman collection:

```json
{
  "info": {
    "name": "Smart Campus Resource Catalogue API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": {
          "raw": "http://localhost:8080/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "auth", "login"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@campus.edu\",\"password\":\"admin123456\"}"
        }
      }
    },
    {
      "name": "Create Resource",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:8080/api/admin/resources",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "admin", "resources"]
        }
      }
    }
  ]
}
```

---

## Development Notes

- All timestamps are in ISO 8601 format (UTC)
- Resource IDs are MongoDB ObjectIds (24 characters)
- Soft delete (archiving) is preferred over permanent deletion
- Non-archived resources are returned by default in list endpoints
- Availability windows are optional
- Capacity is optional (NULL for unlimited resources)

