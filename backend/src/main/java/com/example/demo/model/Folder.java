package com.example.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "folders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_folder_user_parent_name",
                        columnNames = {
                                "user_id",
                                "parent_folder_id",
                                "name"
                        }
                )
        }
)
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "parent_folder_id")
    private UUID parentFolderId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =========================
    // TRASH
    // =========================

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // =========================
    // STARRED / FAVOURITE
    // =========================

    @Column(nullable = false)
    private boolean starred = false;

    public Folder() {
    }

    // =========================
    // CREATED DATE
    // =========================

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // =========================
    // ID
    // =========================

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    // =========================
    // NAME
    // =========================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // =========================
    // USER ID
    // =========================

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    // =========================
    // PARENT FOLDER
    // =========================

    public UUID getParentFolderId() {
        return parentFolderId;
    }

    public void setParentFolderId(UUID parentFolderId) {
        this.parentFolderId = parentFolderId;
    }

    // =========================
    // CREATED AT
    // =========================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =========================
    // DELETED
    // =========================

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    // =========================
    // DELETED AT
    // =========================

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    // =========================
    // STARRED
    // =========================

    public boolean isStarred() {
        return starred;
    }

    public void setStarred(boolean starred) {
        this.starred = starred;
    }
}
