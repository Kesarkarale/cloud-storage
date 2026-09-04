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
            Folder parent = folderRepository.findById(parentFolderId)
                    .orElseThrow(() ->
                            new RuntimeException("Parent folder not found")
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

    public List<Folder> getFolders(
            UUID userId,
            UUID parentFolderId
    ) {

        if (parentFolderId == null) {
            return folderRepository
                    .findByUserIdAndParentFolderIdIsNull(userId);
        }

        Folder parent = folderRepository.findById(parentFolderId)
                .orElseThrow(() ->
                        new RuntimeException("Folder not found")
                );

        if (!parent.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to access this folder"
            );
        }

        return folderRepository
                .findByUserIdAndParentFolderId(
                        userId,
                        parentFolderId
                );
    }

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

        deleteFolderRecursively(folderId, userId);
    }

 private void deleteFolderRecursively(
        UUID folderId,
        UUID userId
)

    // =========================
// GET TRASH FOLDERS
// =========================

public List<Folder> getTrashFolders(UUID userId) {

    return folderRepository.findByUserIdAndDeletedTrue(userId);
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

    // Delete all files inside folder
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

    // Delete folder from database
    folderRepository.delete(folder);
}
