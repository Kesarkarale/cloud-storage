package com.example.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "file_shares",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_file_shared_email",
                        columnNames = {"file_id", "shared_with_email"}
                )
        }
)
public class FileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @Column(name = "owner_user_id", nullable = false)
    private UUID ownerUserId;

    @Column(name = "shared_with_email", nullable = false)
    private String sharedWithEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Share permission = Share.VIEWER;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public FileShare() {
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getFileId() {
        return fileId;
    }

    public void setFileId(UUID fileId) {
        this.fileId = fileId;
    }

    public UUID getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(UUID ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getSharedWithEmail() {
        return sharedWithEmail;
    }

    public void setSharedWithEmail(String sharedWithEmail) {
        this.sharedWithEmail = sharedWithEmail;
    }

    public Share getPermission() {
        return permission;
    }

    public void setPermission(Share permission) {
        this.permission = permission;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
