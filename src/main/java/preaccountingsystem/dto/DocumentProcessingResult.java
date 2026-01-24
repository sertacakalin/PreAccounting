package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of document processing (OCR + extraction)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentProcessingResult {
    private Long documentId;
    private String status;
    private String ocrText;
    private Double ocrConfidence;
    private String ocrProvider;
    private String extractedData; // JSON string of extracted fields
    private String error;
    private long processingTimeMs;
}
