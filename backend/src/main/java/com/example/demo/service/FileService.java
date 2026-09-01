package com.example.demo.service;

import com.example.demo.model.File;
import com.example.demo.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final FileRepository fileRepository;

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;

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
            UUID userId
    ) {

        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new RuntimeException(
                    "File cannot be empty"
            );
        }

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
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

            /*
             * Prevent path traversal.
             * Example:
             * ../../secret.txt
             */

            String safeFileName =
                    Paths.get(originalFileName)
                            .getFileName()
                            .toString();

            /*
             * Generate unique stored filename
             */

            String storedFileName =
                    UUID.randomUUID()
                            + "_"
                            + safeFileName;

            Path targetPath =
                    uploadDirectory.resolve(
                            storedFileName
                    ).normalize();

            /*
             * Make sure file stays inside uploads directory
             */

            if (!targetPath.startsWith(
                    uploadDirectory
            )) {

                throw new RuntimeException(
                        "Invalid file path"
                );
            }

            /*
             * Save actual file
             */

            Files.copy(
                    multipartFile.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            /*
             * Save metadata in database
             */

            File file = new File();

            file.setFileName(safeFileName);

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

            return fileRepository.save(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File upload failed",
                    e
            );
        }
    }


    // =========================
    // GET USER FILES
    // =========================

    public List<File> getUserFiles(UUID userId) {

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }

        return fileRepository.findByUserId(userId);
    }


    // =========================
    // GET SINGLE FILE
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

        /*
         * Check ownership
         */

        if (!file.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You are not allowed to access this file"
            );
        }

        return file;
    }


    // =========================
    // DOWNLOAD FILE
    // =========================

    public byte[] downloadFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                getFile(fileId, userId);

        try {

            Path path =
                    Paths.get(
                            file.getFilePath()
                    );

            if (!Files.exists(path)) {

                throw new RuntimeException(
                        "Physical file not found"
                );
            }

            return Files.readAllBytes(path);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File download failed",
                    e
            );
        }
    }


    // =========================
    // DELETE FILE
    // =========================

    public void deleteFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                getFile(fileId, userId);

        try {

            Path path =
                    Paths.get(
                            file.getFilePath()
                    );

            /*
             * Delete actual file
             */

            Files.deleteIfExists(path);

            /*
             * Delete database record
             */

            fileRepository.delete(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File deletion failed",
                    e
            );
        }
    }
}