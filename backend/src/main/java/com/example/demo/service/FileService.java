package com.example.demo.service;

import com.example.demo.model.File;
import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;

    private final Path uploadDirectory =
            Paths.get("uploads")
                    .toAbsolutePath()
                    .normalize();

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
                    "Could not create upload directory",
                    e
            );
        }
    }

    // =========================
    // UPLOAD FILE
    // =========================

    public File uploadFile(
            MultipartFile multipartFile,
            UUID userId,
            UUID parentFolderId
    ) {

        if (multipartFile == null ||
                multipartFile.isEmpty()) {

            throw new RuntimeException(
                    "File cannot be empty"
            );
        }

        if (parentFolderId != null) {

            Folder folder =
                    folderRepository.findById(
                            parentFolderId
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Folder not found"
                            )
                    );

            if (!folder.getUserId().equals(userId)) {

                throw new RuntimeException(
                        "You are not allowed to upload here"
                );
            }
        }

        try {

            String originalFileName =
                    multipartFile.getOriginalFilename();

            if (originalFileName == null ||
                    originalFileName.isBlank()) {

                throw new RuntimeException(
                        "Invalid file name"
                );
            }

            String safeOriginalName =
                    Paths.get(originalFileName)
                            .getFileName()
                            .toString();

            String storedFileName =
                    UUID.randomUUID()
                            + "_"
                            + safeOriginalName;

            Path targetPath =
                    uploadDirectory.resolve(
                            storedFileName
                    ).normalize();

            if (!targetPath.startsWith(uploadDirectory)) {

                throw new RuntimeException(
                        "Invalid file path"
                );
            }

            Files.copy(
                    multipartFile.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            File file = new File();

            file.setFileName(safeOriginalName);

            file.setFileType(
                    multipartFile.getContentType() != null
                            ? multipartFile.getContentType()
                            : "application/octet-stream"
            );

            file.setFileSize(
                    multipartFile.getSize()
            );

            file.setFilePath(
                    targetPath.toString()
            );

            file.setUserId(userId);

            file.setParentFolderId(
                    parentFolderId
            );

            file.setDeleted(false);
            file.setDeletedAt(null);

            return fileRepository.save(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File upload failed",
                    e
            );
        }
    }

    // =========================
    // GET ACTIVE FILES
    // =========================

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

    // =========================
    // GET FILE
    // =========================

    public File getFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository.findById(fileId)
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

    // =========================
    // MOVE FILE TO TRASH
    // =========================

    public void deleteFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                fileRepository.findById(fileId)
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

        // IMPORTANT:
        // Physical file is NOT deleted here.
        // Only marked as deleted.

        file.setDeleted(true);
        file.setDeletedAt(
                LocalDateTime.now()
        );

        fileRepository.save(file);
    }

    // =========================
    // GET TRASH
    // =========================

    public List<File> getTrashFiles(
            UUID userId
    ) {

        return fileRepository
                .findByUserIdAndDeletedTrue(
                        userId
                );
    }

    // =========================
    // RESTORE FILE
    // =========================

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
        file.setDeleted(false);
        file.setDeletedAt(null);

        fileRepository.save(file);
    }

    // =========================
    // PERMANENT DELETE
    // =========================

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

            // Delete physical file
            Files.deleteIfExists(
                    Paths.get(
                            file.getFilePath()
                    )
            );

            // Delete database record
            fileRepository.delete(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Permanent file deletion failed",
                    e
            );
        }
    }

    // =========================
    // EMPTY TRASH
    // =========================

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

        // Delete all DB records
        fileRepository.deleteAll(
                trashFiles
        );
    }
}
