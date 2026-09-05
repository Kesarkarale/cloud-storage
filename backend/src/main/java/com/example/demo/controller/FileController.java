package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.FileService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;

    public FileController(
            FileService fileService,
            UserRepository userRepository
    ) {
        this.fileService = fileService;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET CURRENT USER ID
    // =========================================================

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

    // Our JwtAuthenticationFilter stores User
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

        // -----------------------------------------------------
        // Case 2: Principal is Spring UserDetails
        // -----------------------------------------------------

        if (principal instanceof UserDetails) {

            UserDetails userDetails =
                    (UserDetails) principal;

            String email =
                    userDetails.getUsername();

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Authenticated user not found"
                                    )
                            );

            if (user.getId() == null) {
                throw new RuntimeException(
                        "User ID is missing"
                );
            }

            return user.getId();
        }

        // -----------------------------------------------------
        // Case 3: Principal is String
        // -----------------------------------------------------

        if (principal instanceof String) {

            String email =
                    principal.toString();

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Authenticated user not found"
                                    )
                            );

            if (user.getId() == null) {
                throw new RuntimeException(
                        "User ID is missing"
                );
            }

            return user.getId();
        }

        // -----------------------------------------------------
        // Fallback: Authentication name
        // -----------------------------------------------------

        String username =
                authentication.getName();

        if (username == null ||
                username.isBlank()) {

            throw new RuntimeException(
                    "Could not identify authenticated user"
            );
        }

        User user =
                userRepository
                        .findByEmail(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found: "
                                                + username
                                )
                        );

        if (user.getId() == null) {
            throw new RuntimeException(
                    "User ID is missing"
            );
        }

        return user.getId();
    }

    // =========================================================
    // UPLOAD FILE
    // =========================================================

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<File> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) UUID parentFolderId,
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

    return ResponseEntity.ok(uploadedFile);
}
    // =========================================================
    // GET ACTIVE FILES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<File>> getFiles(

            @RequestParam(
                    value = "parentFolderId",
                    required = false
            )
            UUID parentFolderId,

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

    // =========================================================
    // DOWNLOAD
    // =========================================================

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

            Path path =
                    Paths.get(
                            file.getFilePath()
                    );

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (!resource.exists() ||
                    !resource.isReadable()) {

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
                    "Could not download file: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // PREVIEW
    // =========================================================

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

            Path path =
                    Paths.get(
                            file.getFilePath()
                    );

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (!resource.exists() ||
                    !resource.isReadable()) {

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
                    "Could not preview file: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // MOVE TO TRASH
    // =========================================================

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
