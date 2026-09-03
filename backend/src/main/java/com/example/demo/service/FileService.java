package com.example.demo.service;

import com.example.demo.model.File;
import com.example.demo.model.Folder;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.FolderRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
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

            return fileRepository.save(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File upload failed",
                    e
            );
        }
    }

    public List<File> getFiles(
            UUID userId,
            UUID parentFolderId
    ) {

        if (parentFolderId == null) {

            return fileRepository
                    .findByUserIdAndParentFolderIdIsNull(
                            userId
                    );
        }

        return fileRepository
                .findByUserIdAndParentFolderId(
                        userId,
                        parentFolderId
                );
    }

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

        return file;
    }

    public void deleteFile(
            UUID fileId,
            UUID userId
    ) {

        File file =
                getFile(
                        fileId,
                        userId
                );

        try {

            Files.deleteIfExists(
                    Paths.get(
                            file.getFilePath()
                    )
            );

            fileRepository.delete(file);

        } catch (IOException e) {

            throw new RuntimeException(
                    "File deletion failed",
                    e
            );
        }
    }
}
