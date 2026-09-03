package com.example.demo.repository;

import com.example.demo.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByUserIdAndParentFolderId(
            UUID userId,
            UUID parentFolderId
    );

    List<Folder> findByUserIdAndParentFolderIdIsNull(
            UUID userId
    );
}
