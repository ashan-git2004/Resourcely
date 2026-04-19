package com.smartcampus.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import org.springframework.stereotype.Service;

/**
 * Service for generating QR codes for bookings.
 * Converts booking data into scannable QR codes for check-in verification.
 */
@Service
public class QrCodeService {

    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;

    /**
     * Generates a QR code containing the booking verification data.
     * Data format: "BOOKING:{bookingId}:{userId}"
     *
     * @param bookingId the booking ID to encode
     * @param userId the user ID for verification
     * @return Base64 encoded PNG image of the QR code
     * @throws WriterException if QR code generation fails
     */
    public String generateQrCode(String bookingId, String userId) throws WriterException {
        String data = String.format("BOOKING:%s:%s", bookingId, userId);
        
        MultiFormatWriter writer = new MultiFormatWriter();
        BitMatrix bitMatrix = writer.encode(data, BarcodeFormat.QR_CODE, QR_CODE_WIDTH, QR_CODE_HEIGHT);
        
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] imageBytes = outputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Verifies and extracts booking data from a QR code string.
     *
     * @param qrData the scanned QR code data
     * @return extracted booking and user IDs as {bookingId, userId}
     * @throws IllegalArgumentException if QR code format is invalid
     */
    public BookingVerificationData verifyQrCode(String qrData) {
        if (qrData == null || !qrData.startsWith("BOOKING:")) {
            throw new IllegalArgumentException("Invalid QR code format");
        }

        String[] parts = qrData.split(":");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid QR code format");
        }

        return new BookingVerificationData(parts[1], parts[2]);
    }

    /**
     * Data class for QR code verification results.
     */
    public static class BookingVerificationData {
        public final String bookingId;
        public final String userId;

        public BookingVerificationData(String bookingId, String userId) {
            this.bookingId = bookingId;
            this.userId = userId;
        }
    }
}
