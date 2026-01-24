package preaccountingsystem.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * DTO representing the result of OCR processing
 */
@Data
@Builder
public class OcrResult {
    /**
     * Extracted text from the image
     */
    private String text;

    /**
     * Confidence score (0.0 to 1.0)
     */
    private double confidence;

    /**
     * Name of the OCR provider used
     */
    private String providerName;

    /**
     * Additional metadata about the OCR process
     */
    private Map<String, Object> metadata;
}
