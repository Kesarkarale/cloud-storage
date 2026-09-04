package com.example.demo.service;

import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;
import org.springframework.stereotype.Service;

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

            if (parent.isDeleted()) {
                throw new RuntimeException(
                        "Cannot create folder inside a deleted folder"
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

        // New folders are not starred
        folder.setStarred(false);

        // New folders are active
        folder.setDeleted(false);
        folder.setDeletedAt(null);

        return folderRepository.save(folder);
    }

    // =========================
    // GET FOLDERS
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

        if (parent.isDeleted()) {
            throw new RuntimeException(
                    "Folder is in trash"
            );
        }

        return folderRepository
                .findByUserIdAndParentFolderIdAndDeletedFalse(
                        userId,
                        parentFolderId
                );
    }

    // =========================
    // GET STARRED FOLDERS
    // =========================

    public List<Folder> getStarredFolders(
            UUID userId
    ) {

        return folderRepository
                .findByUserIdAndStarredTrueAndDeletedFalse(
                        userId
                );
    }

    // =========================
    // STAR FOLDER
    // =========================

    public Folder starFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findByIdAndUserIdAndDeletedFalse(
                                folderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        folder.setStarred(true);

        return folderRepository.save(folder);
    }

    // =========================
    // UNSTAR FOLDER
    // =========================

    public Folder unstarFolder(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findByIdAndUserIdAndDeletedFalse(
                                folderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        folder.setStarred(false);

        return folderRepository.save(folder);
    }

    // =========================
    // TOGGLE STAR
    // =========================

    public Folder toggleStar(
            UUID folderId,
            UUID userId
    ) {

        Folder folder =
                folderRepository
                        .findByIdAndUserIdAndDeletedFalse(
                                folderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                )
                        );

        folder.setStarred(!folder.isStarred());

        return folderRepository.save(folder);
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
    // RECURSIVE DELETE
    // =========================

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

            deleteFolderRecursively(
                    child.getId(),
                    userId
            );
        }

        List<com.example.demo.model.File> files =
                fileRepository
                        .findByUserIdAndParentFolderId(
                                userId,
                                folderId
                        );

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

        folderRepository.deleteById(folderId);
    }
}
