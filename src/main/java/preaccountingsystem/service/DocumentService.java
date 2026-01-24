package preaccountingsystem.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.OcrException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.DocumentRepository;
import preaccountingsystem.service.ocr.OcrOrchestrator;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for document upload and OCR processing
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final OcrOrchestrator ocrOrchestrator;
    private final ObjectMapper objectMapper;
    private final preaccountingsystem.service.ocr.classification.DocumentClassifier documentClassifier;
    private final preaccountingsystem.service.extraction.IntelligentFieldExtractor fieldExtractor;

    @Value("${file.upload.dir:uploads/documents}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/tiff",
        "image/bmp",
        "application/pdf"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload a document
     */
    @Transactional
    public DocumentUploadResponse uploadDocument(
        MultipartFile file,
        Long companyId,
        User user
    ) {
        log.info("Uploading document: filename={}, size={}, company={}",
            file.getOriginalFilename(), file.getSize(), companyId);

        // Validate company
        Customer company = customerRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        // Validate file
        validateFile(file);

        try {
            // Save file to disk
            String filePath = saveFile(file);

            // Create document entity
            Document document = Document.builder()
                .filename(file.getOriginalFilename())
                .filePath(filePath)
                .fileContent(file.getBytes()) // Store in DB for OCR processing
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .status(DocumentStatus.UPLOADED)
                .company(company)
                .uploadedBy(user)
                .build();

            document = documentRepository.save(document);

            log.info("Document uploaded successfully. ID: {}", document.getId());

            return DocumentUploadResponse.builder()
                .documentId(document.getId())
                .filename(document.getFilename())
                .status(document.getStatus().name())
                .message("Document uploaded successfully. Ready for processing.")
                .build();

        } catch (IOException e) {
            throw new BusinessException("Failed to upload document: " + e.getMessage());
        }
    }

    /**
     * Process document with OCR
     */
    @Transactional
    public DocumentProcessingResult processDocument(Long documentId, Long companyId) {
        log.info("Processing document: id={}, company={}", documentId, companyId);

        Document document = documentRepository.findByIdAndCompanyId(documentId, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (document.getStatus() == DocumentStatus.PROCESSED) {
            log.warn("Document already processed: {}", documentId);
            return buildProcessingResult(document, 0);
        }

        long startTime = System.currentTimeMillis();

        try {
            // Update status
            document.setStatus(DocumentStatus.PROCESSING);
            documentRepository.save(document);

            // Convert byte array to BufferedImage
            BufferedImage image = bytesToImage(document.getFileContent());

            // 1. Perform OCR
            OcrResult ocrResult = ocrOrchestrator.processDocument(image);

            // 2. Classify document type
            DocumentType docType = documentClassifier.classify(ocrResult.getText());
            log.info("Document classified as: {}", docType);

            // 3. Extract structured fields using AI
            DocumentFields extractedFields = fieldExtractor.extractFields(
                ocrResult.getText(),
                docType
            );
            log.info("Fields extracted. Overall confidence: {}", extractedFields.getOverallConfidence());

            // 4. Update document with all results
            document.setOcrText(ocrResult.getText());
            document.setOcrConfidence(ocrResult.getConfidence());
            document.setOcrProvider(ocrResult.getProviderName());
            document.setDocumentType(docType);
            document.setExtractedData(objectMapper.writeValueAsString(extractedFields));
            document.setStatus(DocumentStatus.PROCESSED);
            document.setProcessedAt(LocalDateTime.now());

            documentRepository.save(document);

            long duration = System.currentTimeMillis() - startTime;

            log.info("Document processed successfully. ID: {}, Duration: {}ms, Confidence: {}",
                document.getId(), duration, ocrResult.getConfidence());

            return buildProcessingResult(document, duration);

        } catch (OcrException e) {
            log.error("OCR processing failed for document: {}", documentId, e);

            document.setStatus(DocumentStatus.ERROR);
            document.setProcessingError(e.getMessage());
            documentRepository.save(document);

            long duration = System.currentTimeMillis() - startTime;

            return DocumentProcessingResult.builder()
                .documentId(document.getId())
                .status(DocumentStatus.ERROR.name())
                .error(e.getMessage())
                .processingTimeMs(duration)
                .build();

        } catch (Exception e) {
            log.error("Unexpected error processing document: {}", documentId, e);

            document.setStatus(DocumentStatus.ERROR);
            document.setProcessingError("Unexpected error: " + e.getMessage());
            documentRepository.save(document);

            long duration = System.currentTimeMillis() - startTime;

            return DocumentProcessingResult.builder()
                .documentId(document.getId())
                .status(DocumentStatus.ERROR.name())
                .error(e.getMessage())
                .processingTimeMs(duration)
                .build();
        }
    }

    /**
     * Get document by ID
     */
    @Transactional(readOnly = true)
    public DocumentDto getDocument(Long documentId, Long companyId) {
        Document document = documentRepository.findByIdAndCompanyId(documentId, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        return convertToDto(document);
    }

    /**
     * Get all documents for a company
     */
    @Transactional(readOnly = true)
    public List<DocumentDto> getAllDocuments(Long companyId) {
        List<Document> documents = documentRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        return documents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get documents by status
     */
    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsByStatus(Long companyId, DocumentStatus status) {
        List<Document> documents = documentRepository
            .findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, status);
        return documents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Delete document
     */
    @Transactional
    public void deleteDocument(Long documentId, Long companyId) {
        Document document = documentRepository.findByIdAndCompanyId(documentId, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Delete file from disk
        try {
            Path path = Paths.get(document.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete file from disk: {}", document.getFilePath(), e);
        }

        documentRepository.delete(document);
        log.info("Document deleted: {}", documentId);
    }

    // Private helper methods

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum limit of 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Invalid file type. Allowed types: " +
                String.join(", ", ALLOWED_CONTENT_TYPES));
        }
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";

        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return filePath.toString();
    }

    private BufferedImage bytesToImage(byte[] imageData) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(imageData)) {
            BufferedImage image = ImageIO.read(bais);
            if (image == null) {
                throw new IOException("Failed to read image from byte array");
            }
            return image;
        }
    }

    private DocumentProcessingResult buildProcessingResult(Document document, long duration) {
        return DocumentProcessingResult.builder()
            .documentId(document.getId())
            .status(document.getStatus().name())
            .ocrText(document.getOcrText())
            .ocrConfidence(document.getOcrConfidence())
            .ocrProvider(document.getOcrProvider())
            .extractedData(document.getExtractedData())
            .processingTimeMs(duration)
            .build();
    }

    private DocumentDto convertToDto(Document document) {
        return DocumentDto.builder()
            .id(document.getId())
            .filename(document.getFilename())
            .contentType(document.getContentType())
            .fileSize(document.getFileSize())
            .status(document.getStatus().name())
            .documentType(document.getDocumentType() != null ?
                document.getDocumentType().name() : null)
            .ocrText(document.getOcrText())
            .ocrConfidence(document.getOcrConfidence())
            .ocrProvider(document.getOcrProvider())
            .extractedData(document.getExtractedData())
            .processingError(document.getProcessingError())
            .companyId(document.getCompany().getId())
            .uploadedById(document.getUploadedBy() != null ?
                document.getUploadedBy().getId() : null)
            .uploadedByName(document.getUploadedBy() != null ?
                document.getUploadedBy().getUsername() : null)
            .createdAt(document.getCreatedAt())
            .updatedAt(document.getUpdatedAt())
            .processedAt(document.getProcessedAt())
            .build();
    }
}
