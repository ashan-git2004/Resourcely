package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByStatusAndResourceId(BookingStatus status, String resourceId);

    List<Booking> findByStatusAndUserId(BookingStatus status, String userId);

    List<Booking> findByStartTimeGreaterThanAndEndTimeLessThanAndResourceId(
            Instant startTime, Instant endTime, String resourceId);

    // Find bookings within a date range
    List<Booking> findByStartTimeGreaterThanEqual(Instant startTime);

    List<Booking> findByEndTimeLessThanEqual(Instant endTime);

    List<Booking> findByStartTimeBetween(Instant start, Instant end);
}
