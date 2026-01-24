package preaccountingsystem.service.ocr.provider;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import preaccountingsystem.dto.OcrResult;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Tesseract OCR provider implementation
 * Fast, free, and works offline
 */
@Slf4j
@Service
public class TesseractOcrProvider implements OcrProvider {

    private static final Pattern DATE_PATTERN = Pattern.compile("\\d{2}/\\d{2}/\\d{4}");
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\\d+[.,]\\d{2}");
    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d+");

    @Override
    public OcrResult extractText(BufferedImage image) {
        log.info("Starting Tesseract OCR processing");

        try {
            ITesseract tesseract = new Tesseract();

            // Configure Tesseract
            tesseract.setLanguage("tur+eng"); // Turkish + English
            tesseract.setPageSegMode(1); // Automatic page segmentation with OSD
            tesseract.setOcrEngineMode(1); // Neural nets LSTM engine only

            // Perform OCR
            long startTime = System.currentTimeMillis();
            String text = tesseract.doOCR(image);
            long duration = System.currentTimeMillis() - startTime;

            // Calculate confidence score
            double confidence = calculateConfidence(text);

            log.info("Tesseract OCR completed. Duration: {}ms, Confidence: {}, Text length: {}",
                duration, confidence, text.length());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("duration_ms", duration);
            metadata.put("text_length", text.length());

            return OcrResult.builder()
                .text(text)
                .confidence(confidence)
                .providerName(getProviderName())
                .metadata(metadata)
                .build();

        } catch (TesseractException e) {
            log.error("Tesseract OCR failed", e);

            return OcrResult.builder()
                .text("")
                .confidence(0.0)
                .providerName(getProviderName())
                .metadata(Map.of("error", e.getMessage()))
                .build();
        }
    }

    /**
     * Calculate confidence score based on text characteristics
     * Uses heuristics to estimate OCR quality
     */
    private double calculateConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // Word count check (minimum 10 words for good confidence)
        String[] words = text.split("\\s+");
        if (words.length >= 10) {
            score += 0.3;
        } else if (words.length >= 5) {
            score += 0.15;
        }

        // Contains numbers (documents usually have amounts, dates, etc.)
        if (NUMBER_PATTERN.matcher(text).find()) {
            score += 0.2;
        }

        // Contains date pattern (DD/MM/YYYY)
        if (DATE_PATTERN.matcher(text).find()) {
            score += 0.25;
        }

        // Contains amount pattern (price format)
        if (AMOUNT_PATTERN.matcher(text).find()) {
            score += 0.25;
        }

        // Check for excessive special characters (might indicate poor OCR)
        long specialChars = text.chars()
            .filter(c -> !Character.isLetterOrDigit(c) && !Character.isWhitespace(c))
            .count();
        double specialCharRatio = (double) specialChars / text.length();

        // Too many special characters reduces confidence
        if (specialCharRatio > 0.3) {
            score *= 0.7;
        }

        return Math.min(1.0, Math.max(0.0, score));
    }

    @Override
    public String getProviderName() {
        return "Tesseract";
    }

    @Override
    public int getPriority() {
        return 1; // Try first (free and fast)
    }
}
