package com.example.demo.controller;

import com.example.demo.model.Folder;
import com.example.demo.model.User;
import com.example.demo.service.FolderService;

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

    // =========================
    // GET CURRENT USER ID
    // =========================

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
    // CREATE FOLDER
    // =========================

    @PostMapping
    public ResponseEntity<Folder> createFolder(
            @RequestParam String name,
            @RequestParam(required = false)
            UUID parentFolderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        Folder folder =
                folderService.createFolder(
                        name,
                        parentFolderId,
                        userId
                );

        return ResponseEntity.ok(folder);
    }

    // =========================
    // GET FOLDERS
    // =========================

    @GetMapping
    public ResponseEntity<List<Folder>> getFolders(
            @RequestParam(required = false)
            UUID parentFolderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        List<Folder> folders =
                folderService.getFolders(
                        userId,
                        parentFolderId
                );

        return ResponseEntity.ok(folders);
    }

    // =========================
    // MOVE FOLDER TO TRASH
    // =========================

    @DeleteMapping("/{folderId}")
    public ResponseEntity<String> deleteFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        folderService.deleteFolder(
                folderId,
                userId
        );

        return ResponseEntity.ok(
                "Folder moved to trash successfully"
        );
    }

    // =========================
    // GET TRASH FOLDERS
    // =========================

    @GetMapping("/trash")
    public ResponseEntity<List<Folder>> getTrashFolders(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        return ResponseEntity.ok(
                folderService.getTrashFolders(userId)
        );
    }

    // =========================
    // RESTORE FOLDER
    // =========================

    @PostMapping("/{folderId}/restore")
    public ResponseEntity<String> restoreFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        folderService.restoreFolder(
                folderId,
                userId
        );

        return ResponseEntity.ok(
                "Folder restored successfully"
        );
    }

    // =========================
    // PERMANENT DELETE FOLDER
    // =========================

    @DeleteMapping("/{folderId}/permanent")
    public ResponseEntity<String> permanentlyDeleteFolder(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        folderService.permanentlyDeleteFolder(
                folderId,
                userId
        );

        return ResponseEntity.ok(
                "Folder permanently deleted"
        );
    }
}
