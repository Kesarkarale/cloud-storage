package com.example.demo.service;

import com.example.demo.model.File;
import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;

    // =========================================================
    // UPLOAD DIRECTORY
    // =========================================================

    private final Path uploadDirectory =
            Paths.get("uploads")
                    .toAbsolutePath()
                    .normalize();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public FileService(
            FileRepository fileRepository,
            FolderRepository folderRepository
    ) {

        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;

        try {

            Files.createDirectories(uploadDirectory);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not create upload directory: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // UPLOAD FILE
    // =========================================================

    public File uploadFile(
            MultipartFile multipartFile,
            UUID userId,
            UUID parentFolderId
    ) {

        // -----------------------------------------------------
        // Validate file
        // -----------------------------------------------------

        if (multipartFile == null ||
                multipartFile.isEmpty()) {

            throw new RuntimeException(
                    "File cannot be empty"
            );
        }

        // -----------------------------------------------------
        // Validate user
        // -----------------------------------------------------

        if (userId == null) {

            throw new RuntimeException(
                    "User ID is missing"
            );
        }

        // -----------------------------------------------------
        // Validate parent folder
        // -----------------------------------------------------

        if (parentFolderId != null) {

            Folder folder =
                    folderRepository
                            .findById(parentFolderId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Folder not found"
                                    )
                            );

            if (folder.getUserId() == null ||
                    !folder.getUserId().equals(userId)) {

                throw new RuntimeException(
                        "You are not allowed to upload to this folder"
                );
            }
        }

        // -----------------------------------------------------
        // Get original filename
        // -----------------------------------------------------

        String originalFileName =
                multipartFile.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        // -----------------------------------------------------
        // Make filename safe
        // -----------------------------------------------------

        String safeFileName;

        try {

            safeFileName =
                    Paths.get(originalFileName)
                            .getFileName()
                            .toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid file name",
                    e
            );
        }

        if (safeFileName.isBlank()) {

            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        // -----------------------------------------------------
        // Generate unique stored filename
        // -----------------------------------------------------

        String storedFileName =
                UUID.randomUUID()
                        + "_"
                        + safeFileName;

        // -----------------------------------------------------
        // Create target path
        // -----------------------------------------------------

        Path targetPath =
                uploadDirectory
                        .resolve(storedFileName)
                        .normalize();

        // -----------------------------------------------------
        // Security check
        // -----------------------------------------------------

        if (!targetPath.startsWith(uploadDirectory)) {

            throw new RuntimeException(
                    "Invalid file path"
            );
        }

        try {

            // -------------------------------------------------
            // Make sure upload directory exists
            // -------------------------------------------------

            Files.createDirectories(
                    uploadDirectory
            );

            // -------------------------------------------------
            // Save physical file
            // -------------------------------------------------

            Files.copy(
                    multipartFile.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // -------------------------------------------------
            // Create database entity
            // -------------------------------------------------

            File file = new File();

            file.setFileName(
                    safeFileName
            );

            // -------------------------------------------------
            // File type
            // -------------------------------------------------

            String contentType =
                    multipartFile.getContentType();

            if (contentType != null &&
                    !contentType.isBlank()) {

                file.setFileType(
                        contentType
                );

            } else {

                file.setFileType(
                        "application/octet-stream"
                );
            }

            // -------------------------------------------------
            // File size
            // -------------------------------------------------

            file.setFileSize(
                    multipartFile.getSize()
            );

            // -------------------------------------------------
            // Physical file path
            // -------------------------------------------------

            file.setFilePath(
                    targetPath
                            .toAbsolutePath()
                            .toString()
            );

            // -------------------------------------------------
            // Owner
            // -------------------------------------------------

            file.setUserId(
                    userId
            );

            // -------------------------------------------------
            // Parent folder
            // -------------------------------------------------

            file.setParentFolderId(
                    parentFolderId
            );

            // -------------------------------------------------
            // Trash status
            // -------------------------------------------------

            file.setDeleted(
                    false
            );

            file.setDeletedAt(
                    null
            );

            // -------------------------------------------------
            // Save database record
            // -------------------------------------------------

            return fileRepository.save(
                    file
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not save uploaded file: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // GET ACTIVE FILES
    // =========================================================

    public List<File> getFiles(
            UUID userId,
            UUID parentFolderId
    ) {

        if (parentFolderId == null) {

            return fileRepository
                    .findByUserIdAndDeletedFalseAndParentFolderIdIsNull(
                            userId
                    );
        }

        return fileRepository
                .findByUserIdAndDeletedFalseAndParentFolderId(
                        userId,
                        parentFolderId
                );
    }

    // =========================================================
    // GET FILE
    // =========================================================

    public File getFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository
                        .findById(fileId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "File not found"
                                )
                        );

        if (!file.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to access this file"
            );
        }

        if (file.isDeleted()) {

            throw new RuntimeException(
                    "File is in trash"
            );
        }

        return file;
    }

    // =========================================================
    // MOVE FILE TO TRASH
    // =========================================================

    public void deleteFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository
                        .findById(fileId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "File not found"
                                )
                        );

        if (!file.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to delete this file"
            );
        }

        if (file.isDeleted()) {

            throw new RuntimeException(
                    "File is already in trash"
            );
        }

        // Physical file is NOT deleted.
        // Only mark it as deleted.

        file.setDeleted(
                true
        );

        file.setDeletedAt(
                LocalDateTime.now()
        );

        fileRepository.save(
                file
        );
    }

    // =========================================================
    // GET TRASH FILES
    // =========================================================

    public List<File> getTrashFiles(
            UUID userId
    ) {

        return fileRepository
                .findByUserIdAndDeletedTrue(
                        userId
                );
    }

    // =========================================================
    // RESTORE FILE
    // =========================================================

    public void restoreFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository
                        .findByIdAndUserIdAndDeletedTrue(
                                fileId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trashed file not found"
                                )
                        );

        // Restore file

        file.setDeleted(
                false
        );

        file.setDeletedAt(
                null
        );

        fileRepository.save(
                file
        );
    }

    // =========================================================
    // PERMANENT DELETE
    // =========================================================

    public void permanentlyDeleteFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository
                        .findByIdAndUserIdAndDeletedTrue(
                                fileId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trashed file not found"
                                )
                        );

        try {

            // -------------------------------------------------
            // Delete physical file
            // -------------------------------------------------

            Files.deleteIfExists(
                    Paths.get(
                            file.getFilePath()
                    )
            );

            // -------------------------------------------------
            // Delete database record
            // -------------------------------------------------

            fileRepository.delete(
                    file
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Permanent file deletion failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // EMPTY TRASH
    // =========================================================

    public void emptyTrash(
            UUID userId
    ) {

        List<File> trashFiles =
                fileRepository
                        .findByUserIdAndDeletedTrue(
                                userId
                        );

        for (File file : trashFiles) {

            try {

                // ---------------------------------------------
                // Delete physical file
                // ---------------------------------------------

                Files.deleteIfExists(
                        Paths.get(
                                file.getFilePath()
                        )
                );

            } catch (IOException e) {

                throw new RuntimeException(
                        "Could not delete physical file: "
                                + file.getFileName(),
                        e
                );
            }
        }

        // -----------------------------------------------------
        // Delete all database records
        // -----------------------------------------------------

        fileRepository.deleteAll(
                trashFiles
        );
    }
}
