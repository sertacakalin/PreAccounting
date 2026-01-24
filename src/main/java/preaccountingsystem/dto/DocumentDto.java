package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Document entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private String status;
    private String documentType;
    private String ocrText;
    private Double ocrConfidence;
    private String ocrProvider;
    private String extractedData; // JSON string
    private String processingError;
    private Long companyId;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime processedAt;
}
