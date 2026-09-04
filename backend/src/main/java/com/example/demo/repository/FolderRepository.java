package com.example.demo.repository;

import com.example.demo.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    // =========================
    // ALL FOLDERS
    // =========================

    List<Folder> findByUserIdAndParentFolderId(
            UUID userId,
            UUID parentFolderId
    );

    List<Folder> findByUserIdAndParentFolderIdIsNull(
            UUID userId
    );

    // =========================
    // ACTIVE FOLDERS
    // =========================

    List<Folder> findByUserIdAndParentFolderIdAndDeletedFalse(
            UUID userId,
            UUID parentFolderId
    );

    List<Folder> findByUserIdAndParentFolderIdIsNullAndDeletedFalse(
            UUID userId
    );

    // =========================
    // TRASH FOLDERS
    // =========================

    List<Folder> findByUserIdAndDeletedTrue(
            UUID userId
    );

    Optional<Folder> findByIdAndUserIdAndDeletedTrue(
            UUID id,
            UUID userId
    );

    // =========================
    // STARRED / FAVOURITE
    // =========================

    List<Folder> findByUserIdAndStarredTrueAndDeletedFalse(
            UUID userId
    );

    Optional<Folder> findByIdAndUserIdAndDeletedFalse(
            UUID id,
            UUID userId
    );
}
