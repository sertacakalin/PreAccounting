package preaccountingsystem.service.ocr.classification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import preaccountingsystem.entity.DocumentType;
import preaccountingsystem.service.AIService;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DocumentClassifier
 */
@ExtendWith(MockitoExtension.class)
class DocumentClassifierTest {

    @Mock
    private AIService aiService;

    private DocumentClassifier classifier;

    @BeforeEach
    void setUp() {
        classifier = new DocumentClassifier(aiService);
    }

    @Test
    void testClassify_invoice_byKeyword() {
        // Given: Text containing "fatura"
        String text = """
            ABC ŞİRKETİ
            FATURA
            Fatura No: 2024/001
            Tarih: 15/01/2024
            Toplam: 1.500,00 TL
            """;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.INVOICE, type);
    }

    @Test
    void testClassify_receipt_byKeyword() {
        // Given: Text containing "fiş"
        String text = """
            CARREFOUR
            SATIŞ FİŞİ
            15/01/2024 14:32
            TOPLAM: 127,50 TL
            """;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.RECEIPT, type);
    }

    @Test
    void testClassify_contract_byKeyword() {
        // Given: Text containing "sözleşme"
        String text = """
            KİRA SÖZLEŞMESİ
            Taraflar arasında yapılan anlaşma...
            """;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.CONTRACT, type);
    }

    @Test
    void testClassify_bankStatement_byKeyword() {
        // Given: Text containing "dekont"
        String text = """
            BANKA DEKONTU
            EFT İşlemi
            Referans No: 123456789
            Tutar: 5.000,00 TL
            """;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.BANK_STATEMENT, type);
    }

    @Test
    void testClassify_emptyText_shouldReturnOther() {
        // Given: Empty text
        String text = "";

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.OTHER, type);
    }

    @Test
    void testClassify_nullText_shouldReturnOther() {
        // Given: Null text
        String text = null;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.OTHER, type);
    }

    @Test
    void testClassify_noKeywords_shouldReturnOther() {
        // Given: Text with no recognizable keywords
        String text = """
            Some random text that doesn't match any keywords
            with numbers 123 and dates 01/01/2024
            but no document type indicators
            """;

        // When
        DocumentType type = classifier.classify(text);

        // Then
        // Should fallback to OTHER (AI classification placeholder returns OTHER)
        assertEquals(DocumentType.OTHER, type);
    }

    @Test
    void testClassify_caseInsensitive() {
        // Given: Text with mixed case
        String text = "INVOICE Number: 12345";

        // When
        DocumentType type = classifier.classify(text);

        // Then
        assertEquals(DocumentType.INVOICE, type);
    }
}
