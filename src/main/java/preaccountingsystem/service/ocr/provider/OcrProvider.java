package preaccountingsystem.service.ocr.provider;

import preaccountingsystem.dto.OcrResult;

import java.awt.image.BufferedImage;

/**
 * Interface for OCR providers
 * Implements Strategy pattern for different OCR engines
 */
public interface OcrProvider {

    /**
     * Extract text from an image
     *
     * @param image The image to process
     * @return OCR result with text, confidence, and metadata
     */
    OcrResult extractText(BufferedImage image);

    /**
     * Get the name of this provider
     *
     * @return Provider name
     */
    String getProviderName();

    /**
     * Get the priority of this provider (lower = try first)
     *
     * @return Priority number
     */
    int getPriority();
}
