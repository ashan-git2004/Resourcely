package com.smartcampus.dto.response;

public class QrCodeResponse {
    private String qrCodeData;  // Base64 encoded PNG image
    private String bookingId;
    private String resourceName;
    private String startTime;
    private String endTime;

    public QrCodeResponse() {
    }

    public QrCodeResponse(String qrCodeData, String bookingId, String resourceName, String startTime, String endTime) {
        this.qrCodeData = qrCodeData;
        this.bookingId = bookingId;
        this.resourceName = resourceName;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
