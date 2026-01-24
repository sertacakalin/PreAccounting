package preaccountingsystem.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import preaccountingsystem.dto.DocumentDto;
import preaccountingsystem.dto.DocumentProcessingResult;
import preaccountingsystem.dto.DocumentUploadResponse;
import preaccountingsystem.entity.DocumentStatus;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.DocumentService;

import java.util.List;

/**
 * REST controller for document upload and OCR processing
 */
@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
@Tag(name = "Documents", description = "Document upload and OCR processing API")
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Upload a document for OCR processing
     */
    @PostMapping("/upload")
    @Operation(summary = "Upload document", description = "Upload a document (image or PDF) for OCR processing")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal User currentUser
    ) {
        log.info("Document upload request from user: {}", currentUser.getUsername());

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        DocumentUploadResponse response = documentService.uploadDocument(
            file,
            currentUser.getCustomer().getId(),
            currentUser
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Process uploaded document with OCR
     */
    @PostMapping("/{id}/process")
    @Operation(summary = "Process document", description = "Process document with OCR and extract text")
    public ResponseEntity<DocumentProcessingResult> processDocument(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        log.info("Document processing request: documentId={}, user={}",
            id, currentUser.getUsername());

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        DocumentProcessingResult result = documentService.processDocument(
            id,
            currentUser.getCustomer().getId()
        );

        return ResponseEntity.ok(result);
    }

    /**
     * Upload and process document in one step
     */
    @PostMapping("/upload-and-process")
    @Operation(summary = "Upload and process", description = "Upload a document and immediately process it with OCR")
    public ResponseEntity<DocumentProcessingResult> uploadAndProcess(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal User currentUser
    ) {
        log.info("Upload and process request from user: {}", currentUser.getUsername());

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        Long companyId = currentUser.getCustomer().getId();

        // Upload
        DocumentUploadResponse uploadResponse = documentService.uploadDocument(
            file,
            companyId,
            currentUser
        );

        // Process
        DocumentProcessingResult result = documentService.processDocument(
            uploadResponse.getDocumentId(),
            companyId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Get document by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get document", description = "Get document details by ID")
    public ResponseEntity<DocumentDto> getDocument(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        DocumentDto document = documentService.getDocument(
            id,
            currentUser.getCustomer().getId()
        );

        return ResponseEntity.ok(document);
    }

    /**
     * Get all documents for current company
     */
    @GetMapping
    @Operation(summary = "Get all documents", description = "Get all documents for the current company")
    public ResponseEntity<List<DocumentDto>> getAllDocuments(
        @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<DocumentDto> documents = documentService.getAllDocuments(
            currentUser.getCustomer().getId()
        );

        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by status
     */
    @GetMapping("/by-status/{status}")
    @Operation(summary = "Get documents by status", description = "Get documents filtered by processing status")
    public ResponseEntity<List<DocumentDto>> getDocumentsByStatus(
        @PathVariable String status,
        @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        DocumentStatus documentStatus;
        try {
            documentStatus = DocumentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }

        List<DocumentDto> documents = documentService.getDocumentsByStatus(
            currentUser.getCustomer().getId(),
            documentStatus
        );

        return ResponseEntity.ok(documents);
    }

    /**
     * Delete document
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document", description = "Delete a document")
    public ResponseEntity<Void> deleteDocument(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        documentService.deleteDocument(
            id,
            currentUser.getCustomer().getId()
        );

        return ResponseEntity.noContent().build();
    }
}
