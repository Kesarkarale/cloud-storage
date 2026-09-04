package com.example.demo.controller;

import com.example.demo.model.File;
import com.example.demo.model.Folder;
import com.example.demo.model.User;
import com.example.demo.service.FileService;
import com.example.demo.service.FolderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trash")
public class TrashController {

    private final FileService fileService;
    private final FolderService folderService;

    public TrashController(
            FileService fileService,
            FolderService folderService
    ) {
        this.fileService = fileService;
        this.folderService = folderService;
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
    public ResponseEntity<List<Object>> getTrash(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        List<File> files =
                fileService.getTrashFiles(userId);

        List<Folder> folders =
                folderService.getTrashFolders(userId);

        List<Object> trashItems =
                new ArrayList<>();

        trashItems.addAll(files);
        trashItems.addAll(folders);

        return ResponseEntity.ok(trashItems);
    }


    // =========================
    // RESTORE
    // =========================

    @PostMapping("/{id}/restore")
    public ResponseEntity<String> restoreItem(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        try {

            fileService.restoreFile(
                    id,
                    userId
            );

            return ResponseEntity.ok(
                    "File restored successfully"
            );

        } catch (RuntimeException fileException) {

            folderService.restoreFolder(
                    id,
                    userId
            );

            return ResponseEntity.ok(
                    "Folder restored successfully"
            );
        }
    }


    // =========================
    // PERMANENT DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> permanentlyDelete(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        try {

            fileService.permanentlyDeleteFile(
                    id,
                    userId
            );

            return ResponseEntity.ok(
                    "File permanently deleted"
            );

        } catch (RuntimeException fileException) {

            folderService.permanentlyDeleteFolder(
                    id,
                    userId
            );

            return ResponseEntity.ok(
                    "Folder permanently deleted"
            );
        }
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

        fileService.emptyTrash(userId);

        List<Folder> folders =
                folderService.getTrashFolders(userId);

        for (Folder folder : folders) {

            try {

                folderService.permanentlyDeleteFolder(
                        folder.getId(),
                        userId
                );

            } catch (RuntimeException ignored) {
            }
        }

        return ResponseEntity.ok(
                "Trash emptied successfully"
        );
    }
}
