package com.example.demo.service;

import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
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

    // =========================
    // CREATE FOLDER
    // =========================

    public Folder createFolder(
            String name,
            UUID parentFolderId,
            UUID userId
    ) {

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Folder name cannot be empty");
        }

        String cleanName = name.trim();

        if (parentFolderId != null) {

            Folder parent =
                    folderRepository.findById(parentFolderId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parent folder not found"
                                    )
                            );

            if (!parent.getUserId().equals(userId)) {
                throw new RuntimeException(
                        "You are not allowed to use this folder"
                );
            }
        }

        List<Folder> existingFolders;

        if (parentFolderId == null) {

            existingFolders =
                    folderRepository
                            .findByUserIdAndParentFolderIdIsNull(userId);

        } else {

            existingFolders =
                    folderRepository
                            .findByUserIdAndParentFolderId(
                                    userId,
                                    parentFolderId
                            );
        }

        boolean alreadyExists =
                existingFolders.stream()
                        .anyMatch(folder ->
                                folder.getName()
                                        .equalsIgnoreCase(cleanName)
                        );

        if (alreadyExists) {
            throw new RuntimeException(
                    "A folder with this name already exists"
            );
        }

        Folder folder = new Folder();

        folder.setName(cleanName);
        folder.setUserId(userId);
        folder.setParentFolderId(parentFolderId);

        return folderRepository.save(folder);
    }

    // =========================
    // GET ACTIVE FOLDERS
    // =========================

    public List<Folder> getFolders(
            UUID userId,
            UUID parentFolderId
    ) {

        if (parentFolderId == null) {

            return folderRepository
                    .findByUserIdAndParentFolderIdIsNullAndDeletedFalse(
                            userId
                    );
        }

        Folder parent =
                folderRepository.findById(parentFolderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        if (!parent.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to access this folder"
            );
        }

        return folderRepository
                .findByUserIdAndParentFolderIdAndDeletedFalse(
                        userId,
                        parentFolderId
                );
    }

    // =========================
    // DELETE FOLDER
    // =========================

    public void deleteFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository.findById(folderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        if (!folder.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to delete this folder"
            );
        }

        deleteFolderRecursively(
                folderId,
                userId
        );
    }

    // =========================
    // SOFT DELETE FOLDER
    // =========================

    private void deleteFolderRecursively(
            UUID folderId,
            UUID userId
    ) {

        // Find child folders
        List<Folder> children =
                folderRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        // Soft delete child folders recursively
        for (Folder child : children) {

            deleteFolderRecursively(
                    child.getId(),
                    userId
            );
        }

        // Find files inside this folder
        List<com.example.demo.model.File> files =
                fileRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

        // Soft delete files
        for (com.example.demo.model.File file : files) {

            file.setDeleted(true);
            file.setDeletedAt(LocalDateTime.now());

            fileRepository.save(file);
        }

        // Find current folder
        Folder folder =
                folderRepository.findById(folderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        // Soft delete folder
        folder.setDeleted(true);
        folder.setDeletedAt(LocalDateTime.now());

        folderRepository.save(folder);
    }

    // =========================
    // GET TRASH FOLDERS
    // =========================

    public List<Folder> getTrashFolders(
            UUID userId
    ) {

        return folderRepository
                .findByUserIdAndDeletedTrue(userId);
    }

    // =========================
    // RESTORE FOLDER
    // =========================

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
                                        "Trashed folder not found"
                                )
                        );

        folder.setDeleted(false);
        folder.setDeletedAt(null);

        folderRepository.save(folder);
    }

    // =========================
    // PERMANENT DELETE FOLDER
    // =========================

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
                                        "Trashed folder not found"
                                )
                        );

        permanentlyDeleteFolderRecursively(
                folder,
                userId
        );
    }

    // =========================
    // PERMANENT DELETE RECURSIVE
    // =========================

    private void permanentlyDeleteFolderRecursively(
            Folder folder,
            UUID userId
    ) {

        // Find child folders
        List<Folder> children =
                folderRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folder.getId()
                        );

        // Delete child folders recursively
        for (Folder child : children) {

            permanentlyDeleteFolderRecursively(
                    child,
                    userId
            );
        }

        // Find files inside folder
        List<com.example.demo.model.File> files =
                fileRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folder.getId()
                        );

        // Delete physical files + database records
        for (com.example.demo.model.File file : files) {

            try {

                java.nio.file.Files.deleteIfExists(
                        java.nio.file.Paths.get(
                                file.getFilePath()
                        )
                );

            } catch (Exception ignored) {
            }

            fileRepository.delete(file);
        }

        // Delete folder
        folderRepository.delete(folder);
    }
}
