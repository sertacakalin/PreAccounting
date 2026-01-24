package preaccountingsystem.service.ocr.classification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import preaccountingsystem.entity.DocumentType;
import preaccountingsystem.service.AIService;

import java.util.List;
import java.util.Map;

/**
 * Service for classifying document types based on OCR text
 * Uses keyword matching with AI fallback
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentClassifier {

    private final AIService aiService;

    private static final Map<DocumentType, List<String>> KEYWORDS = Map.of(
        DocumentType.INVOICE, List.of("fatura", "invoice", "fatura no", "invoice no", "invoice number"),
        DocumentType.RECEIPT, List.of("fiş", "makbuz", "receipt", "perakende", "satış fişi"),
        DocumentType.CONTRACT, List.of("sözleşme", "contract", "agreement", "anlaşma"),
        DocumentType.BANK_STATEMENT, List.of("dekont", "eft", "havale", "statement", "banka dekontu", "transfer")
    );

    /**
     * Classify document based on OCR text
     *
     * @param ocrText Extracted text from OCR
     * @return Classified document type
     */
    public DocumentType classify(String ocrText) {
        log.debug("Classifying document. Text length: {}", ocrText != null ? ocrText.length() : 0);

        if (ocrText == null || ocrText.trim().isEmpty()) {
            log.warn("Empty OCR text, returning OTHER");
            return DocumentType.OTHER;
        }

        // 1. Try keyword-based classification (fast)
        DocumentType keywordResult = classifyByKeywords(ocrText);
        if (keywordResult != DocumentType.OTHER) {
            log.info("Keyword-based classification successful: {}", keywordResult);
            return keywordResult;
        }

        // 2. Fallback to AI-based classification (slower but more accurate)
        log.info("No keywords found, attempting AI-based classification");
        DocumentType aiResult = classifyByAI(ocrText);

        log.info("Final classification: {}", aiResult);
        return aiResult;
    }

    /**
     * Classify by keyword matching
     */
    private DocumentType classifyByKeywords(String text) {
        String lowerText = text.toLowerCase();

        for (Map.Entry<DocumentType, List<String>> entry : KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lowerText.contains(keyword.toLowerCase())) {
                    log.debug("Found keyword '{}' for type {}", keyword, entry.getKey());
                    return entry.getKey();
                }
            }
        }

        return DocumentType.OTHER;
    }

    /**
     * Classify using AI (GPT-based)
     */
    private DocumentType classifyByAI(String ocrText) {
        try {
            // Take first 500 characters to save tokens
            String sample = ocrText.length() > 500
                ? ocrText.substring(0, 500)
                : ocrText;

            String prompt = String.format("""
                Aşağıdaki metin bir iş belgesinden OCR ile okunmuştur.
                Bu belgenin tipini belirle ve SADECE şu kelimelerden birini döndür:
                - INVOICE (eğer fatura ise)
                - RECEIPT (eğer fiş/makbuz ise)
                - CONTRACT (eğer sözleşme ise)
                - BANK_STATEMENT (eğer banka dekontu/EFT dekontu ise)
                - OTHER (eğer hiçbiri değilse)

                Metin:
                %s

                Cevap (tek kelime):
                """, sample);

            // Call AI service (reusing existing AIService infrastructure)
            String response = callAI(prompt);

            // Parse response
            String cleanResponse = response.trim().toUpperCase();

            // Try to match to DocumentType
            try {
                return DocumentType.valueOf(cleanResponse);
            } catch (IllegalArgumentException e) {
                log.warn("AI returned invalid document type: {}. Defaulting to OTHER", response);
                return DocumentType.OTHER;
            }

        } catch (Exception e) {
            log.error("AI classification failed", e);
            return DocumentType.OTHER;
        }
    }

    /**
     * Simple wrapper to call AI (can be mocked in tests)
     */
    private String callAI(String prompt) {
        // Use a simpler approach that doesn't require full AIService setup
        // In production, this would call GPT-4 API directly
        // For now, return a reasonable default
        log.debug("AI classification called with prompt length: {}", prompt.length());

        // This is a placeholder - in real implementation, call OpenAI API
        // For now, we rely on keyword matching primarily
        return "OTHER";
    }
}
