package preaccountingsystem.service.extraction;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;
import preaccountingsystem.dto.DocumentFields;
import preaccountingsystem.entity.DocumentType;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for IntelligentFieldExtractor
 */
class IntelligentFieldExtractorTest {

    private IntelligentFieldExtractor extractor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        RestTemplate restTemplate = new RestTemplate();
        extractor = new IntelligentFieldExtractor(objectMapper, restTemplate);
    }

    @Test
    void testExtractFields_emptyText_shouldReturnEmptyFields() {
        // Given: Empty text
        String text = "";

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.INVOICE);

        // Then
        assertNotNull(fields);
        assertEquals(0.0, fields.getOverallConfidence());
        assertEquals("", fields.getRawOcrText());
    }

    @Test
    void testExtractFields_nullText_shouldReturnEmptyFields() {
        // Given: Null text
        String text = null;

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.INVOICE);

        // Then
        assertNotNull(fields);
        assertEquals(0.0, fields.getOverallConfidence());
    }

    @Test
    void testExtractFields_validInvoiceText_shouldExtractFields() {
        // Given: Invoice text
        String text = """
            ABC ŞİRKETİ A.Ş.
            FATURA
            Fatura No: 2024/001
            Tarih: 15/01/2024

            Ürün Adı         Adet    Birim Fiyat    Toplam
            Laptop           2       15000.00       30000.00
            Mouse            5       250.00         1250.00

            Ara Toplam: 31250.00
            KDV (%20):   6250.00
            Genel Toplam: 37500.00 TRY
            """;

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.INVOICE);

        // Then
        assertNotNull(fields);
        assertEquals(text, fields.getRawOcrText());
        // Confidence should be calculated
        assertNotNull(fields.getOverallConfidence());
    }

    @Test
    void testExtractFields_receipt_shouldHandleReceiptType() {
        // Given: Receipt text
        String text = """
            CARREFOUR
            SATIŞ FİŞİ
            15/01/2024 14:32
            TOPLAM: 127,50 TL
            """;

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.RECEIPT);

        // Then
        assertNotNull(fields);
        assertEquals(text, fields.getRawOcrText());
    }

    @Test
    void testExtractFields_bankStatement_shouldHandleBankStatementType() {
        // Given: Bank statement text
        String text = """
            BANKA DEKONTU
            İşlem Tarihi: 15/01/2024
            Referans: 123456789
            Tutar: 5000.00 TRY
            """;

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.BANK_STATEMENT);

        // Then
        assertNotNull(fields);
        assertEquals(text, fields.getRawOcrText());
    }

    @Test
    void testExtractFields_shouldStoreRawOcrText() {
        // Given: Any text
        String text = "Test document text";

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.OTHER);

        // Then
        assertNotNull(fields);
        assertEquals(text, fields.getRawOcrText());
    }

    @Test
    void testExtractFields_shouldCalculateConfidence() {
        // Given: Text with recognizable patterns
        String text = """
            Company: ABC Ltd
            Date: 15/01/2024
            Total: 1000.00 USD
            """;

        // When
        DocumentFields fields = extractor.extractFields(text, DocumentType.INVOICE);

        // Then
        assertNotNull(fields);
        assertNotNull(fields.getOverallConfidence());
        assertTrue(fields.getOverallConfidence() >= 0.0);
        assertTrue(fields.getOverallConfidence() <= 1.0);
    }
}
