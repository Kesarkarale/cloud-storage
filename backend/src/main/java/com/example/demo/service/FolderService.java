package com.example.demo.service;

import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;

    public FolderService(
            FolderRepository folderRepository,
            FileRepository fileRepository
    ) {
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
    }

    // =========================================================
    // CREATE FOLDER
    // =========================================================

    public Folder createFolder(
            String name,
            UUID parentFolderId,
            UUID userId
    ) {

        if (userId == null) {
            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException(
                    "Folder name cannot be empty."
            );
        }

        String cleanName = name.trim();

        if (cleanName.length() > 255) {
            throw new RuntimeException(
                    "Folder name cannot exceed 255 characters."
            );
        }

        // =====================================================
        // CHECK PARENT FOLDER
        // =====================================================

        if (parentFolderId != null) {

            Folder parent =
                    folderRepository
                            .findById(parentFolderId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parent folder not found."
                                    )
                            );

            if (!parent.getUserId().equals(userId)) {
                throw new RuntimeException(
                        "You are not allowed to use this folder."
                );
            }

            if (parent.isDeleted()) {
                throw new RuntimeException(
                        "Cannot create a folder inside a deleted folder."
                );
            }
        }

        // =====================================================
        // CHECK DUPLICATE
        // =====================================================

        List<Folder> existingFolders;

        if (parentFolderId == null) {

            existingFolders =
                    folderRepository
                            .findByUserIdAndParentFolderIdIsNull(
                                    userId
                            );

        } else {

            existingFolders =
                    folderRepository
                            .findByUserIdAndParentFolderId(
                                    userId,
                                    parentFolderId
                            );
        }

        boolean alreadyExists =
                existingFolders
                        .stream()
                        .anyMatch(folder ->
                                !folder.isDeleted()
                                        && folder.getName() != null
                                        && folder.getName()
                                        .equalsIgnoreCase(cleanName)
                        );

        if (alreadyExists) {

            throw new RuntimeException(
                    "A folder with this name already exists."
            );
        }

        // =====================================================
        // CREATE
        // =====================================================

        Folder folder = new Folder();

        folder.setName(cleanName);
        folder.setUserId(userId);
        folder.setParentFolderId(parentFolderId);
        folder.setDeleted(false);
        folder.setDeletedAt(null);

        return folderRepository.save(folder);
    }

    // =========================================================
    // GET FOLDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Folder> getFolders(
            UUID userId,
            UUID parentFolderId
    ) {

        if (userId == null) {
            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        if (parentFolderId == null) {

            return folderRepository
                    .findByUserIdAndParentFolderIdIsNull(userId)
                    .stream()
                    .filter(folder -> !folder.isDeleted())
                    .toList();
        }

        Folder parent =
                folderRepository
                        .findById(parentFolderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found."
                                )
                        );

        if (!parent.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to access this folder."
            );
        }

        if (parent.isDeleted()) {
            throw new RuntimeException(
                    "This folder is in trash."
            );
        }

        return folderRepository
                .findByUserIdAndParentFolderId(
                        userId,
                        parentFolderId
                )
                .stream()
                .filter(folder -> !folder.isDeleted())
                .toList();
    }

    // =========================================================
    // SOFT DELETE FOLDER
    // =========================================================

    public void deleteFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findById(folderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found."
                                )
                        );

        if (!folder.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to delete this folder."
            );
        }

        if (folder.isDeleted()) {
            throw new RuntimeException(
                    "Folder is already in trash."
            );
        }

        deleteFolderRecursively(
                folderId,
                userId
        );
    }

    private void deleteFolderRecursively(
            UUID folderId,
            UUID userId
    ) {

        List<Folder> children =
                folderRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        for (Folder child : children) {

            if (!child.isDeleted()) {

                deleteFolderRecursively(
                        child.getId(),
                        userId
                );
            }
        }

        // =====================================================
        // DELETE FILES INSIDE FOLDER
        // =====================================================

        List<com.example.demo.model.File> files =
                fileRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        LocalDateTime now =
                LocalDateTime.now();

        for (
                com.example.demo.model.File file
                : files
        ) {

            file.setDeleted(true);
            file.setDeletedAt(now);

            fileRepository.save(file);
        }

        // =====================================================
        // DELETE FOLDER
        // =====================================================

        Folder folder =
                folderRepository
                        .findById(folderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found."
                                )
                        );

        folder.setDeleted(true);
        folder.setDeletedAt(now);

        folderRepository.save(folder);
    }

    // =========================================================
    // GET TRASH
    // =========================================================

    @Transactional(readOnly = true)
    public List<Folder> getTrashFolders(
            UUID userId
    ) {

        return folderRepository
                .findByUserIdAndDeletedTrue(userId);
    }

    // =========================================================
    // RESTORE
    // =========================================================

    public void restoreFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findByIdAndUserIdAndDeletedTrue(
                                folderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trashed folder not found."
                                )
                        );

        folder.setDeleted(false);
        folder.setDeletedAt(null);

        folderRepository.save(folder);
    }

    // =========================================================
    // PERMANENT DELETE
    // =========================================================

    public void permanentlyDeleteFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findByIdAndUserIdAndDeletedTrue(
                                folderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trashed folder not found."
                                )
                        );

        permanentlyDeleteChildren(
                folderId,
                userId
        );

        // =====================================================
        // DELETE FILES
        // =====================================================

        List<com.example.demo.model.File> files =
                fileRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        for (
                com.example.demo.model.File file
                : files
        ) {

            try {

                if (file.getFilePath() != null) {

                    Path path =
                            Paths.get(
                                    file.getFilePath()
                            );

                    Files.deleteIfExists(path);
                }

            } catch (Exception ignored) {
                // Database deletion continues even if
                // physical file is already missing.
            }

            fileRepository.delete(file);
        }

        // =====================================================
        // DELETE FOLDER
        // =====================================================

        folderRepository.delete(folder);
    }

    private void permanentlyDeleteChildren(
            UUID folderId,
            UUID userId
    ) {

        List<Folder> children =
                folderRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        for (Folder child : children) {

            permanentlyDeleteChildren(
                    child.getId(),
                    userId
            );

            List<com.example.demo.model.File> files =
                    fileRepository
                            .findByUserIdAndParentFolderId(
                                    userId,
                                    child.getId()
                            );

            for (
                    com.example.demo.model.File file
                    : files
            ) {

                try {

                    if (file.getFilePath() != null) {

                        Files.deleteIfExists(
                                Paths.get(
                                        file.getFilePath()
                                )
                        );
                    }

                } catch (Exception ignored) {
                }

                fileRepository.delete(file);
            }

            folderRepository.delete(child);
        }
    }
}
