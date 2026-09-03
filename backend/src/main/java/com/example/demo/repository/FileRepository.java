package com.example.demo.repository;

import com.example.demo.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {

    List<File> findByUserId(UUID userId);

    List<File> findByUserIdAndParentFolderId(
            UUID userId,
            UUID parentFolderId
    );

    List<File> findByUserIdAndParentFolderIdIsNull(
            UUID userId
    );
}
