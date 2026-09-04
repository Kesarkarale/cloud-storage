package com.example.demo.controller;

import com.example.demo.dto.SharedFile;
import com.example.demo.model.Share;
import com.example.demo.model.User;
import com.example.demo.service.ShareService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shares")
public class ShareController {

    private final ShareService shareService;

    public ShareController(
            ShareService shareService
    ) {
        this.shareService = shareService;
    }

    // =========================
    // GET CURRENT USER
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

        User user =
                (User) principal;

        return user.getId();
    }

    // =========================
    // SHARE FILE
    // =========================

    @PostMapping
    public ResponseEntity<SharedFile> shareFile(
            @RequestParam UUID fileId,
            @RequestParam String email,
            @RequestParam(
                    defaultValue = "VIEWER"
            ) Share permission,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(
                        authentication
                );

        SharedFile sharedFile =
                shareService.shareFile(
                        fileId,
                        email,
                        permission,
                        userId
                );

        return ResponseEntity.ok(
                sharedFile
        );
    }

    // =========================
    // FILES SHARED BY ME
    // =========================

    @GetMapping("/by-me")
    public ResponseEntity<List<SharedFile>>
    getSharedByMe(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(
                        authentication
                );

        return ResponseEntity.ok(
                shareService.getSharedByMe(
                        userId
                )
        );
    }

    // =========================
    // FILES SHARED WITH ME
    // =========================

    @GetMapping("/with-me")
    public ResponseEntity<List<SharedFile>>
    getSharedWithMe(
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(
                        authentication
                );

        return ResponseEntity.ok(
                shareService.getSharedWithMe(
                        userId
                )
        );
    }

    // =========================
    // REMOVE SHARE
    // =========================

    @DeleteMapping("/{shareId}")
    public ResponseEntity<String> removeShare(
            @PathVariable UUID shareId,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(
                        authentication
                );

        shareService.removeShare(
                shareId,
                userId
        );

        return ResponseEntity.ok(
                "File share removed successfully"
        );
    }

    // =========================
    // UPDATE PERMISSION
    // =========================

    @PutMapping("/{shareId}/permission")
    public ResponseEntity<SharedFile>
    updatePermission(
            @PathVariable UUID shareId,
            @RequestParam Share permission,
            Authentication authentication
    ) {

        UUID userId =
                getCurrentUserId(
                        authentication
                );

        SharedFile result =
                shareService.updatePermission(
                        shareId,
                        permission,
                        userId
                );

        return ResponseEntity.ok(
                result
        );
    }
}
