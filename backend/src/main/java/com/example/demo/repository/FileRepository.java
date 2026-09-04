package com.example.demo.repository;

import com.example.demo.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {

    List<File> findByUserId(UUID userId);

    List<File> findByUserIdAndParentFolderId(
            UUID userId,
            UUID parentFolderId
    );

    List<File> findByUserIdAndParentFolderIdIsNull(
            UUID userId
    );

    // Only active files
    List<File> findByUserIdAndDeletedFalseAndParentFolderId(
            UUID userId,
            UUID parentFolderId
    );

    List<File> findByUserIdAndDeletedFalseAndParentFolderIdIsNull(
            UUID userId
    );

    // Trash files
    List<File> findByUserIdAndDeletedTrue(
            UUID userId
    );

    // Find a specific trashed file
    java.util.Optional<File> findByIdAndUserIdAndDeletedTrue(
            UUID fileId,
            UUID userId
    );

    // =========================
    // STARRED / FAVOURITE FILES
    // =========================

    List<File> findByUserIdAndStarredTrueAndDeletedFalse(
            UUID userId
    );

    java.util.Optional<File> findByIdAndUserIdAndDeletedFalse(
            UUID fileId,
            UUID userId
    );
}
