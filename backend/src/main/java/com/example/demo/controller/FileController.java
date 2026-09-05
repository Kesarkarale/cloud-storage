package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.model.User;
import com.example.demo.service.FileService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    private UUID getCurrentUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof User user) {

            if (user.getId() == null) {
                throw new RuntimeException(
                        "Authenticated user ID is missing"
                );
            }

            return user.getId();
        }

        throw new RuntimeException(
                "Invalid authenticated user"
        );
    }

    // =====================================================
    // UPLOAD FILE
    // =====================================================

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<File> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(
                    value = "parentFolderId",
                    required = false
            ) UUID parentFolderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        File uploadedFile =
                fileService.uploadFile(
                        file,
                        userId,
                        parentFolderId
                );

        return ResponseEntity.ok(
                uploadedFile
        );
    }

    // =====================================================
    // GET ACTIVE FILES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<File>> getFiles(
            @RequestParam(
                    value = "parentFolderId",
                    required = false
            ) UUID parentFolderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        return ResponseEntity.ok(
                fileService.getFiles(
                        userId,
                        parentFolderId
                )
        );
    }

    // =====================================================
    // DOWNLOAD
    // =====================================================

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        File file =
                fileService.getFile(
                        fileId,
                        userId
                );

        try {

            Resource resource =
                    new UrlResource(
                            Paths.get(
                                    file.getFilePath()
                            ).toUri()
                    );

            if (!resource.exists()) {
                throw new RuntimeException(
                        "Physical file not found"
                );
            }

            MediaType mediaType;

            try {
                mediaType =
                        MediaType.parseMediaType(
                                file.getFileType()
                        );
            } catch (Exception e) {
                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    file.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not download file",
                    e
            );
        }
    }

    // =====================================================
    // PREVIEW
    // =====================================================

    @GetMapping("/{fileId}/preview")
    public ResponseEntity<Resource> previewFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        File file =
                fileService.getFile(
                        fileId,
                        userId
                );

        try {

            Resource resource =
                    new UrlResource(
                            Paths.get(
                                    file.getFilePath()
                            ).toUri()
                    );

            if (!resource.exists()) {
                throw new RuntimeException(
                        "Physical file not found"
                );
            }

            MediaType mediaType;

            try {
                mediaType =
                        MediaType.parseMediaType(
                                file.getFileType()
                        );
            } catch (Exception e) {
                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    file.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not preview file",
                    e
            );
        }
    }

    // =====================================================
    // MOVE TO TRASH
    // =====================================================

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        fileService.deleteFile(
                fileId,
                userId
        );

        return ResponseEntity.ok(
                "File moved to trash successfully"
        );
    }
}
