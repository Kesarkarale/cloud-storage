package com.example.demo.repository;

import com.example.demo.model.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShareRepository
        extends JpaRepository<FileShare, UUID> {

    List<FileShare> findByOwnerUserIdAndActiveTrue(
            UUID ownerUserId
    );

    List<FileShare>
    findBySharedWithEmailIgnoreCaseAndActiveTrue(
            String email
    );

    Optional<FileShare>
    findByFileIdAndSharedWithEmailIgnoreCaseAndActiveTrue(
            UUID fileId,
            String email
    );

    Optional<FileShare>
    findByIdAndActiveTrue(
            UUID id
    );
}
