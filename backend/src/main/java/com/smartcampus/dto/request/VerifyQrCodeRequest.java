package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;

public class VerifyQrCodeRequest {
    @NotBlank(message = "QR code data is required")
    private String qrData;

    public VerifyQrCodeRequest() {
    }

    public VerifyQrCodeRequest(String qrData) {
        this.qrData = qrData;
    }

    public String getQrData() {
        return qrData;
    }

    public void setQrData(String qrData) {
        this.qrData = qrData;
    }
}
