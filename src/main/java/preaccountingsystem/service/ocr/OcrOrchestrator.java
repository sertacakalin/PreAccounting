package preaccountingsystem.service.ocr;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import preaccountingsystem.dto.OcrResult;
import preaccountingsystem.exception.OcrException;
import preaccountingsystem.service.ocr.preprocessing.ImagePreprocessor;
import preaccountingsystem.service.ocr.provider.OcrProvider;

import java.awt.image.BufferedImage;
import java.util.Comparator;
import java.util.List;

/**
 * Orchestrator for OCR processing
 * Coordinates multiple OCR providers with fallback strategy
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OcrOrchestrator {

    @Autowired(required = false)
    private List<OcrProvider> providers;

    private final ImagePreprocessor preprocessor;

    /**
     * Minimum confidence threshold to accept OCR result
     */
    private static final double MIN_CONFIDENCE_THRESHOLD = 0.7;

    /**
     * Process document image through OCR pipeline
     * 1. Preprocess image
     * 2. Try OCR providers in priority order
     * 3. Return first result with sufficient confidence
     *
     * @param image Original document image
     * @return OCR result with text and metadata
     * @throws OcrException if all providers fail
     */
    public OcrResult processDocument(BufferedImage image) {
        log.info("OCR orchestrator starting. Image size: {}x{}", image.getWidth(), image.getHeight());

        // 1. Preprocess the image
        BufferedImage processed = preprocessor.preprocess(image);

        // 2. Get providers sorted by priority
        if (providers == null || providers.isEmpty()) {
            throw new OcrException("No OCR providers configured");
        }

        List<OcrProvider> sortedProviders = providers.stream()
            .sorted(Comparator.comparingInt(OcrProvider::getPriority))
            .toList();

        log.info("Found {} OCR providers: {}",
            sortedProviders.size(),
            sortedProviders.stream()
                .map(p -> String.format("%s(priority=%d)", p.getProviderName(), p.getPriority()))
                .toList()
        );

        // 3. Try each provider until we get sufficient confidence
        OcrResult lastResult = null;

        for (OcrProvider provider : sortedProviders) {
            try {
                log.info("Trying OCR provider: {} (priority={})",
                    provider.getProviderName(), provider.getPriority());

                OcrResult result = provider.extractText(processed);
                lastResult = result;

                log.info("Provider {} completed: confidence={}, text_length={}",
                    result.getProviderName(),
                    result.getConfidence(),
                    result.getText().length()
                );

                // Check if confidence is sufficient
                if (result.getConfidence() >= MIN_CONFIDENCE_THRESHOLD) {
                    log.info("Sufficient confidence achieved. OCR complete.");
                    return result;
                }

                log.warn("Low confidence ({}), trying next provider...", result.getConfidence());

            } catch (Exception e) {
                log.error("Provider {} failed: {}", provider.getProviderName(), e.getMessage(), e);
                // Continue to next provider
            }
        }

        // If we get here, all providers returned low confidence
        // Return the best result we got (or throw if all failed)
        if (lastResult != null && !lastResult.getText().isEmpty()) {
            log.warn("All providers returned low confidence. Returning best result: confidence={}",
                lastResult.getConfidence());
            return lastResult;
        }

        throw new OcrException("All OCR providers failed to extract text");
    }

    /**
     * Get minimum confidence threshold
     */
    public double getMinConfidenceThreshold() {
        return MIN_CONFIDENCE_THRESHOLD;
    }
}
