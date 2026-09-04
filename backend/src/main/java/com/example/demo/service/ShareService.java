package com.example.demo.service;

import com.example.demo.dto.SharedFile;
import com.example.demo.model.File;
import com.example.demo.model.FileShare;
import com.example.demo.model.Share;
import com.example.demo.model.User;
import com.example.demo.repository.FileRepository;
import com.example.demo.repository.ShareRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareService {

    private final ShareRepository shareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    public ShareService(
            ShareRepository shareRepository,
            FileRepository fileRepository,
            UserRepository userRepository
    ) {
        this.shareRepository = shareRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // SHARE FILE
    // =========================

    @Transactional
    public SharedFile shareFile(
            UUID fileId,
            String email,
            Share permission,
            UUID ownerUserId
    ) {

        if (fileId == null) {
            throw new RuntimeException(
                    "File ID is required"
            );
        }

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException(
                    "Email is required"
            );
        }

        String cleanEmail =
                email.trim().toLowerCase(Locale.ROOT);

        if (permission == null) {
            permission = Share.VIEWER;
        }

        File file =
                fileRepository
                        .findByIdAndUserIdAndDeletedFalse(
                                fileId,
                                ownerUserId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "File not found or you are not the owner"
                                )
                        );

        User owner =
                userRepository
                        .findById(ownerUserId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Owner not found"
                                )
                        );

        if (owner.getEmail()
                .equalsIgnoreCase(cleanEmail)) {

            throw new RuntimeException(
                    "You cannot share a file with yourself"
            );
        }

        // User must exist
        User receiver =
                userRepository
                        .findByEmail(cleanEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No registered user found with this email"
                                )
                        );

        if (receiver.getId().equals(ownerUserId)) {
            throw new RuntimeException(
                    "You cannot share a file with yourself"
            );
        }

        FileShare existing =
                shareRepository
                        .findByFileIdAndSharedWithEmailIgnoreCaseAndActiveTrue(
                                fileId,
                                cleanEmail
                        )
                        .orElse(null);

        if (existing != null) {

            existing.setPermission(permission);

            FileShare updated =
                    shareRepository.save(existing);

            return toSharedFile(
                    updated,
                    file,
                    owner
            );
        }

        FileShare fileShare =
                new FileShare();

        fileShare.setFileId(fileId);
        fileShare.setOwnerUserId(ownerUserId);
        fileShare.setSharedWithEmail(cleanEmail);
        fileShare.setPermission(permission);
        fileShare.setActive(true);

        FileShare saved =
                shareRepository.save(fileShare);

        return toSharedFile(
                saved,
                file,
                owner
        );
    }

    // =========================
    // GET SHARED FILES
    // Files shared BY current user
    // =========================

    @Transactional(readOnly = true)
    public List<SharedFile> getSharedByMe(
            UUID ownerUserId
    ) {

        List<FileShare> shares =
                shareRepository
                        .findByOwnerUserIdAndActiveTrue(
                                ownerUserId
                        );

        return shares.stream()
                .map(share -> {

                    File file =
                            fileRepository
                                    .findById(
                                            share.getFileId()
                                    )
                                    .orElse(null);

                    if (file == null ||
                            file.isDeleted()) {
                        return null;
                    }

                    User owner =
                            userRepository
                                    .findById(
                                            share.getOwnerUserId()
                                    )
                                    .orElse(null);

                    if (owner == null) {
                        return null;
                    }

                    return toSharedFile(
                            share,
                            file,
                            owner
                    );
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    // =========================
    // GET SHARED WITH ME
    // =========================

    @Transactional(readOnly = true)
    public List<SharedFile> getSharedWithMe(
            UUID userId
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        List<FileShare> shares =
                shareRepository
                        .findBySharedWithEmailIgnoreCaseAndActiveTrue(
                                user.getEmail()
                        );

        return shares.stream()
                .map(share -> {

                    File file =
                            fileRepository
                                    .findById(
                                            share.getFileId()
                                    )
                                    .orElse(null);

                    if (file == null ||
                            file.isDeleted()) {
                        return null;
                    }

                    User owner =
                            userRepository
                                    .findById(
                                            share.getOwnerUserId()
                                    )
                                    .orElse(null);

                    if (owner == null) {
                        return null;
                    }

                    return toSharedFile(
                            share,
                            file,
                            owner
                    );
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    // =========================
    // REMOVE SHARE
    // =========================

    @Transactional
    public void removeShare(
            UUID shareId,
            UUID currentUserId
    ) {

        FileShare share =
                shareRepository
                        .findByIdAndActiveTrue(
                                shareId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share not found"
                                )
                        );

        if (!share.getOwnerUserId()
                .equals(currentUserId)) {

            throw new RuntimeException(
                    "You are not allowed to remove this share"
            );
        }

        share.setActive(false);

        shareRepository.save(share);
    }

    // =========================
    // UPDATE PERMISSION
    // =========================

    @Transactional
    public SharedFile updatePermission(
            UUID shareId,
            Share permission,
            UUID currentUserId
    ) {

        if (permission == null) {
            throw new RuntimeException(
                    "Permission is required"
            );
        }

        FileShare share =
                shareRepository
                        .findByIdAndActiveTrue(
                                shareId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share not found"
                                )
                        );

        if (!share.getOwnerUserId()
                .equals(currentUserId)) {

            throw new RuntimeException(
                    "You are not allowed to update this share"
            );
        }

        share.setPermission(permission);

        FileShare updated =
                shareRepository.save(share);

        File file =
                fileRepository
                        .findById(
                                share.getFileId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "File not found"
                                )
                        );

        User owner =
                userRepository
                        .findById(
                                share.getOwnerUserId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Owner not found"
                                )
                        );

        return toSharedFile(
                updated,
                file,
                owner
        );
    }

    // =========================
    // CHECK FILE ACCESS
    // =========================

    @Transactional(readOnly = true)
    public FileShare getShareAccess(
            UUID fileId,
            String email
    ) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        return shareRepository
                .findByFileIdAndSharedWithEmailIgnoreCaseAndActiveTrue(
                        fileId,
                        email.trim()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "You do not have access to this file"
                        )
                );
    }

    // =========================
    // DTO MAPPER
    // =========================

    private SharedFile toSharedFile(
            FileShare share,
            File file,
            User owner
    ) {

        SharedFile result =
                new SharedFile();

        result.setId(share.getId());

        result.setFileId(file.getId());

        result.setName(
                file.getFileName()
        );

        result.setType(
                file.getFileType()
        );

        result.setSize(
                file.getFileSize()
        );

        result.setOwner(
                owner.getName()
        );

        result.setOwnerEmail(
                owner.getEmail()
        );

        result.setPermission(
                share.getPermission()
                        .name()
        );

        result.setSharedDate(
                share.getCreatedAt()
        );

        result.setStatus(
                "ACTIVE"
        );

        return result;
    }
}
