package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.model.User;
import com.example.demo.service.FileService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trash")
public class TrashController {

    private final FileService fileService;

    public TrashController(FileService fileService) {
        this.fileService = fileService;
    }

    private UUID getCurrentUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getPrincipal() == null) {

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

        User user = (User) principal;

        return user.getId();
    }

    // =========================
    // GET TRASH
    // =========================

    @GetMapping
    public ResponseEntity<List<File>> getTrash(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        return ResponseEntity.ok(
                fileService.getTrashFiles(
                        userId
                )
        );
    }

    // =========================
    // RESTORE
    // =========================

    @PostMapping("/{fileId}/restore")
    public ResponseEntity<String> restoreFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        fileService.restoreFile(
                fileId,
                userId
        );

        return ResponseEntity.ok(
                "File restored successfully"
        );
    }

    // =========================
    // PERMANENT DELETE
    // =========================

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> permanentlyDelete(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        fileService.permanentlyDeleteFile(
                fileId,
                userId
        );

        return ResponseEntity.ok(
                "File permanently deleted"
        );
    }

    // =========================
    // EMPTY TRASH
    // =========================

    @DeleteMapping("/empty")
    public ResponseEntity<String> emptyTrash(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        fileService.emptyTrash(
                userId
        );

        return ResponseEntity.ok(
                "Trash emptied successfully"
        );
    }
}
