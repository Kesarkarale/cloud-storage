package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.model.User;
import com.example.demo.service.FileService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // =========================
    // UPLOAD
    // =========================

    @PostMapping("/upload")
    public ResponseEntity<File> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        File uploadedFile =
                fileService.uploadFile(
                        file,
                        user.getId()
                );

        return ResponseEntity.ok(uploadedFile);
    }

    // =========================
    // GET MY FILES
    // =========================

    @GetMapping
    public ResponseEntity<List<File>> getMyFiles(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        List<File> files =
                fileService.getUserFiles(
                        user.getId()
                );

        return ResponseEntity.ok(files);
    }

    // =========================
    // DOWNLOAD
    // =========================

    @GetMapping("/{fileId}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        File file =
                fileService.getFile(
                        fileId,
                        user.getId()
                );

        byte[] data =
                fileService.downloadFile(
                        fileId,
                        user.getId()
                );

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
                .body(data);
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        fileService.deleteFile(
                fileId,
                user.getId()
        );

        return ResponseEntity.ok(
                "File deleted successfully"
        );
    }

    // =========================
    // AUTHENTICATED USER
    // =========================

    private User getAuthenticatedUser(
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

        if (!(principal instanceof User)) {

            throw new RuntimeException(
                    "Invalid authenticated user"
            );
        }

        return (User) principal;
    }
}