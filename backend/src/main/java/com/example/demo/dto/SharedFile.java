package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class SharedFile {

    private UUID id;
    private UUID fileId;

    private String name;
    private String type;
    private Long size;

    private String owner;
    private String ownerEmail;

    private String permission;
    private LocalDateTime sharedDate;

    private String status;

    public SharedFile() {
    }

    public SharedFile(
            UUID id,
            UUID fileId,
            String name,
            String type,
            Long size,
            String owner,
            String ownerEmail,
            String permission,
            LocalDateTime sharedDate,
            String status
    ) {
        this.id = id;
        this.fileId = fileId;
        this.name = name;
        this.type = type;
        this.size = size;
        this.owner = owner;
        this.ownerEmail = ownerEmail;
        this.permission = permission;
        this.sharedDate = sharedDate;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFileId() {
        return fileId;
    }

    public void setFileId(UUID fileId) {
        this.fileId = fileId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public LocalDateTime getSharedDate() {
        return sharedDate;
    }

    public void setSharedDate(LocalDateTime sharedDate) {
        this.sharedDate = sharedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
