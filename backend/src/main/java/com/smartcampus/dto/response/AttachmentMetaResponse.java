package com.smartcampus.dto.response;

import java.time.Instant;

public class AttachmentMetaResponse {
    private String id;
    private String ticketId;
    private String fileName;
    private String contentType;
    private long fileSize;
    private Instant uploadedAt;

    public AttachmentMetaResponse(String id, String ticketId, String fileName,
                                   String contentType, long fileSize, Instant uploadedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public String getId() { return id; }
    public String getTicketId() { return ticketId; }
    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
    public long getFileSize() { return fileSize; }
    public Instant getUploadedAt() { return uploadedAt; }
}
