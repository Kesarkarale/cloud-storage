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

    public FolderController(
            FolderService folderService
    ) {
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

        return ((User) principal).getId();
    }

    @PostMapping
    public ResponseEntity<Folder> createFolder(
            @RequestBody CreateFolderRequest request,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        Folder folder =
                folderService.createFolder(
                        request.name(),
                        request.parentFolderId(),
                        userId
                );

        return ResponseEntity.ok(folder);
    }

    @GetMapping
    public ResponseEntity<List<Folder>> getFolders(
            @RequestParam(required = false)
            UUID parentFolderId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(authentication);

        return ResponseEntity.ok(
                folderService.getFolders(
                        userId,
                        parentFolderId
                )
        );
    }

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
                "Folder deleted successfully"
        );
    }

    public record CreateFolderRequest(
            String name,
            UUID parentFolderId
    ) {
    }
}
