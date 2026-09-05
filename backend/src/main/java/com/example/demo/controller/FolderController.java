package com.example.demo.controller;

import com.example.demo.model.Folder;
import com.example.demo.model.User;
import com.example.demo.service.FolderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    // =========================================================
    // CREATE FOLDER REQUEST
    // =========================================================

    public static class CreateFolderRequest {

        private String name;

        /*
         * String ठेवला आहे जेणेकरून:
         *
         * ""
         * null
         * "null"
         * valid UUID
         *
         * सगळे safely handle करता येतील.
         */
        private String parentFolderId;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getParentFolderId() {
            return parentFolderId;
        }

        public void setParentFolderId(String parentFolderId) {
            this.parentFolderId = parentFolderId;
        }
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private UUID getCurrentUserId(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof User)) {
            throw new RuntimeException("Invalid authenticated user");
        }

        User user = (User) principal;

        if (user.getId() == null) {
            throw new RuntimeException("Authenticated user ID is missing");
        }

        return user.getId();
    }

    // =========================================================
    // CREATE FOLDER
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createFolder(
            @RequestBody CreateFolderRequest request,
            Authentication authentication
    ) {

        try {

            UUID userId = getCurrentUserId(authentication);

            // -------------------------
            // Validate request
            // -------------------------

            if (request == null) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse(
                                "Invalid request body."
                        ));
            }

            String name = request.getName();

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse(
                                "Folder name cannot be empty."
                        ));
            }

            String cleanName = name.trim();

            if (cleanName.length() > 255) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse(
                                "Folder name cannot exceed 255 characters."
                        ));
            }

            // -------------------------
            // Parse parent folder ID
            // -------------------------

            UUID parentFolderId = null;

            String parentValue = request.getParentFolderId();

            if (
                    parentValue != null
                            && !parentValue.trim().isEmpty()
                            && !parentValue.equalsIgnoreCase("null")
            ) {

                try {

                    parentFolderId =
                            UUID.fromString(parentValue.trim());

                } catch (IllegalArgumentException exception) {

                    return ResponseEntity
                            .badRequest()
                            .body(new ErrorResponse(
                                    "Invalid parent folder ID."
                            ));
                }
            }

            // -------------------------
            // Create folder
            // -------------------------

            Folder folder =
                    folderService.createFolder(
                            cleanName,
                            parentFolderId,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(folder);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // GET FOLDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getFolders(
            @RequestParam(required = false) String parentFolderId,
            Authentication authentication
    ) {

        try {

            UUID userId =
                    getCurrentUserId(authentication);

            UUID parsedParentId = null;

            if (
                    parentFolderId != null
                            && !parentFolderId.trim().isEmpty()
                            && !parentFolderId.equalsIgnoreCase("null")
            ) {

                try {

                    parsedParentId =
                            UUID.fromString(
                                    parentFolderId.trim()
                            );

                } catch (IllegalArgumentException exception) {

                    return ResponseEntity
                            .badRequest()
                            .body(new ErrorResponse(
                                    "Invalid parent folder ID."
                            ));
                }
            }

            List<Folder> folders =
                    folderService.getFolders(
                            userId,
                            parsedParentId
                    );

            return ResponseEntity.ok(folders);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // DELETE FOLDER
    // =========================================================

    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        try {

            UUID userId =
                    getCurrentUserId(authentication);

            folderService.deleteFolder(
                    folderId,
                    userId
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Folder moved to trash successfully."
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // TRASH
    // =========================================================

    @GetMapping("/trash")
    public ResponseEntity<?> getTrashFolders(
            Authentication authentication
    ) {

        try {

            UUID userId =
                    getCurrentUserId(authentication);

            return ResponseEntity.ok(
                    folderService.getTrashFolders(userId)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // RESTORE
    // =========================================================

    @PostMapping("/{folderId}/restore")
    public ResponseEntity<?> restoreFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        try {

            UUID userId =
                    getCurrentUserId(authentication);

            folderService.restoreFolder(
                    folderId,
                    userId
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Folder restored successfully."
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // PERMANENT DELETE
    // =========================================================

    @DeleteMapping("/{folderId}/permanent")
    public ResponseEntity<?> permanentlyDeleteFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        try {

            UUID userId =
                    getCurrentUserId(authentication);

            folderService.permanentlyDeleteFolder(
                    folderId,
                    userId
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Folder permanently deleted."
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    // =========================================================
    // RESPONSE CLASSES
    // =========================================================

    public static class ErrorResponse {

        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class MessageResponse {

        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
