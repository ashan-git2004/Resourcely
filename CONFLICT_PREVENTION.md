# Booking Conflict Prevention System

## Overview

The Smart Campus booking system automatically prevents scheduling conflicts to ensure resources are not double-booked. The system enforces conflict checks at two critical points:

1. **At Booking Creation** - When users create a new booking request
2. **At Approval** - When admins approve pending bookings

## How Conflict Detection Works

### Overlap Detection Algorithm

Two time ranges overlap if:
```
booking.startTime < requestedEndTime AND booking.endTime > requestedStartTime
```

The system uses this logic to detect ANY overlap between:
- The requested booking time range
- Any approved bookings for the same resource

We explicitly check only **APPROVED** bookings because:
- PENDING bookings are not yet confirmed
- REJECTED bookings are canceled
- CANCELLED bookings are no longer active

### Three Levels of Conflict Checking

#### 1. User Booking Creation (`POST /api/user/bookings`)

**When:** A user attempts to create a new booking request

**What Happens:**
1. User provides: resourceId, startTime, endTime, purpose
2. System validates time constraints
3. System checks for conflicts with approved bookings
4. If conflicts found → Returns HTTP 400 with error message
5. If no conflicts → Books request created with status = PENDING

**Error Response Example:**
```json
{
  "message": "Resource is not available during the requested time period. 2 conflicting booking(s) found."
}
```

**Frontend Method:** `bookingService.createBooking(booking, token)`

#### 2. Admin Approval Decision (`PATCH /api/admin/bookings/{bookingId}/approve`)

**When:** Admin attempts to approve a pending booking

**Why This Matters (Key Insight):**
Two different pending bookings might not conflict individually, but approving both would create a conflict:
- Pending Booking A: 10:00 AM - 11:00 AM (not yet approved)
- Pending Booking B: 10:30 AM - 11:30 AM (not yet approved)

These don't technically "conflict" while both pending, but if approved sequentially, they would overlap!

**What Happens:**
1. Admin selects a pending booking to approve
2. Modal displays and checks for conflicts with approved bookings
3. If conflicts found → Shows warning with conflicting bookings
4. Admin can:
   - **Reject** the booking (if conflicts make approval impossible)
   - **Approve anyway** (with caution and admin reason noted)
5. If no conflicts → Admin can safely approve with confirmation

**Frontend Behavior:**
- Shows yellow warning box with list of conflicting bookings
- Shows green confirmation if no conflicts
- Displays time ranges for conflicting bookings for reference
- Disables Submit button while checking conflicts

**Error Response Example:**
```json
{
  "message": "Cannot approve: resource has conflicting approved booking(s). Please reject this request or reschedule it."
}
```

#### 3. Conflict Check Query (`GET /api/user/bookings/check-conflicts`)

**When:** Users want to check availability before creating a booking

**How to Use:**
```javascript
import { checkBookingConflicts } from './bookingService';

const conflicts = await checkBookingConflicts(
  resourceId,
  startTime.toISOString(),
  endTime.toISOString(),
  token
);

if (conflicts.length > 0) {
  // Show conflicting bookings to user
  console.log("Resource unavailable during requested time");
}
```

**Response:** List of approved bookings that overlap with the requested time period

## API Endpoints

### User Booking Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/user/bookings` | Create new booking (with conflict check) |
| GET | `/api/user/bookings` | Get user's own bookings |
| GET | `/api/user/bookings/{bookingId}` | Get specific booking (user must own it) |
| PATCH | `/api/user/bookings/{bookingId}/cancel` | Cancel approved booking |
| GET | `/api/user/bookings/check-conflicts` | Check availability (query params: resourceId, startTime, endTime) |

### Admin Booking Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/bookings` | Get all bookings (supports filters) |
| GET | `/api/admin/bookings/{bookingId}` | Get specific booking |
| GET | `/api/admin/bookings/status/pending` | Get pending bookings |
| PATCH | `/api/admin/bookings/{bookingId}/approve` | Approve booking (with conflict check) |
| PATCH | `/api/admin/bookings/{bookingId}/reject` | Reject booking |
| PATCH | `/api/admin/bookings/{bookingId}/cancel` | Cancel approved booking |
| GET | `/api/admin/bookings/conflicts` | Check conflicts (query params: resourceId, startTime, endTime) |

## Workflow Example

### Scenario: Two users request the same room

**Timeline:**
1. **10:00 AM** - User A creates booking: Lab Room 101, 2:00 PM - 3:00 PM
   - ✅ Approved (booking service confirms no conflicts)
   - Status: PENDING (waiting for admin)

2. **10:05 AM** - User B creates booking: Lab Room 101, 2:15 PM - 3:15 PM
   - ❌ Conflict detected! (overlaps with User A's booking)
   - Error: "Resource is not available during the requested time period"
   - User B must choose different time

3. **10:10 AM** - User B creates booking: Lab Room 101, 3:00 PM - 4:00 PM
   - ✅ No conflict detected
   - Status: PENDING

4. **11:00 AM** - Admin reviews pending bookings
   - User A's booking: 2:00 PM - 3:00 PM
   - User B's booking: 3:00 PM - 4:00 PM
   - Both are now displayed for approval

5. **Admin approves User A's booking**
   - Conflict check: ✅ Clear (no overlap)
   - Status: APPROVED

6. **Admin approves User B's booking**
   - Conflict check: ✅ Clear (starts when User A ends)
   - Status: APPROVED

7. **Result:** Both bookings are approved without conflicts

## Edge Cases & Special Handling

### Exact Time Boundaries
- Booking A: 2:00 PM - **3:00 PM**
- Booking B: **3:00 PM** - 4:00 PM
- **Result:** ✅ NO CONFLICT (one ends when the other starts)

The overlap check uses `<` and `>` (strictly less than, strictly greater than), not `<=` and `>=`.

### User vs Pending Bookings
- When a user creates a booking, it checks against **APPROVED** bookings only
- This allows multiple PENDING bookings that might conflict if both approved
- Admins must review pending bookings and reject conflicting ones
- This design provides flexibility while preventing confirmed conflicts

### Admin Cancellation
- Admins can cancel approved bookings with a reason
- This frees up the time slot for rescheduling
- Users are NOT notified automatically (consideration for future enhancement)

## Testing Conflict Prevention

### Test Case 1: Creation Conflict
```bash
# Create booking 1
POST /api/user/bookings
{
  "resourceId": "lab-room-101",
  "startTime": "2026-04-15T14:00:00Z",
  "endTime": "2026-04-15T15:00:00Z",
  "purpose": "Lab session"
}
# Returns: 400 if resource already has approved booking in this time

# Create booking 2 (same time, different user)
POST /api/user/bookings
{
  "resourceId": "lab-room-101",
  "startTime": "2026-04-15T14:00:00Z",
  "endTime": "2026-04-15T15:00:00Z",
  "purpose": "Lab session"
}
# Returns: 400 Conflict error
```

### Test Case 2: Approval Conflict
```bash
# Admin checks pending booking details
GET /api/admin/bookings/status/pending

# Admin attempts approval
PATCH /api/admin/bookings/{bookingId1}/approve
# Returns: 200 OK (if no conflicts with approved)

# Admin tries to approve conflicting pending booking
PATCH /api/admin/bookings/{bookingId2}/approve
# Returns: 400 Conflict error (prevents approval)
```

### Test Case 3: Frontend Conflict Warnings
1. Open AdminBookingsPage
2. Click "Approve" on any PENDING booking
3. Modal opens and automatically checks conflicts
4. If conflicts exist, yellow warning appears with details
5. Admin can still attempt approval (with caution) or reject instead

## Implementation Details

### Backend: BookingService.java

**Key Methods:**
- `createBooking()` - Calls checkConflicts() before saving
- `approveBooking()` - Calls checkConflicts() before status change
- `checkConflicts()` - Queries MongoDB for overlapping approved bookings

**Repository Query:**
```java
findByResourceIdAndStartTimeBeforeAndEndTimeAfter(
    resourceId, 
    requestedEndTime,    // booking.startTime < requestedEndTime
    requestedStartTime   // booking.endTime > requestedStartTime
)
```

### Frontend: bookingService.js

**Key Functions:**
- `createBooking(booking, token)` - POST /api/user/bookings
- `checkBookingConflicts(resourceId, startTime, endTime, token)` - GET /api/user/bookings/check-conflicts
- `checkConflicts(resourceId, startTime, endTime, token)` - GET /api/admin/bookings/conflicts

### Frontend: AdminBookingsPage.jsx

**Enhancement:**
- Automatically fetches conflicts when opening approve modal
- Displays conflict warnings with booking details
- Prevents accidental approval of conflicting bookings
- Shows green confirmation when no conflicts detected

## Future Enhancements

1. **Notification System**
   - Notify user when their pending booking is approved
   - Notify user when a conflicting pending booking is approved

2. **Rescheduling Suggestions**
   - When conflict detected, suggest available time slots
   - Help users automatically find alternative times

3. **Conflict Analytics**
   - Track resources with most booking conflicts
   - Identify peak usage patterns
   - Recommend resource availability expansion

4. **Multi-Resource Bookings**
   - Support bookings spanning multiple resources
   - Check conflicts across all requested resources

5. **Buffer Time**
   - Add configurable buffer time between bookings
   - E.g., require 15-minute gap between lab uses for cleanup

## Related Files

- Backend Service: `src/main/java/com/smartcampus/service/BookingService.java`
- Backend Controller: `src/main/java/com/smartcampus/controller/AdminBookingController.java`
- User Controller: `src/main/java/com/smartcampus/controller/UserBookingController.java`
- Repository: `src/main/java/com/smartcampus/repository/BookingRepository.java`
- Frontend Service: `frontend/src/features/admin/bookingService.js`
- Admin UI: `frontend/src/features/admin/AdminBookingsPage.jsx`

## Questions & Support

For questions about booking conflicts or to report issues:
1. Check the error message details
2. Verify resource ID and time ranges
3. Review the timeline of approved vs pending bookings
4. Contact admin team with booking ID and requested time period
