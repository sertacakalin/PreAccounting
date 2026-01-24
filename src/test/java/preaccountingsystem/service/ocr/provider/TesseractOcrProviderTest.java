package preaccountingsystem.service.ocr.provider;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import preaccountingsystem.dto.OcrResult;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TesseractOcrProvider
 */
class TesseractOcrProviderTest {

    private TesseractOcrProvider provider;

    @BeforeEach
    void setUp() {
        provider = new TesseractOcrProvider();
    }

    @Test
    void testGetProviderName() {
        assertEquals("Tesseract", provider.getProviderName());
    }

    @Test
    void testGetPriority() {
        assertEquals(1, provider.getPriority());
    }

    @Test
    void testExtractText_emptyImage_shouldReturnLowConfidence() {
        // Given: An empty white image
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 100, 100);
        g.dispose();

        // When: Extract text
        OcrResult result = provider.extractText(image);

        // Then: Should have low confidence
        assertNotNull(result);
        assertEquals("Tesseract", result.getProviderName());
        assertTrue(result.getConfidence() < 0.5);
    }

    @Test
    void testExtractText_imageWithText_shouldExtractSomething() {
        // Given: An image with simple text
        BufferedImage image = new BufferedImage(200, 50, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 200, 50);
        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.PLAIN, 20));
        g.drawString("INVOICE 123", 10, 30);
        g.dispose();

        // When: Extract text
        OcrResult result = provider.extractText(image);

        // Then: Should extract something
        assertNotNull(result);
        assertNotNull(result.getText());
        assertEquals("Tesseract", result.getProviderName());
    }

    @Test
    void testExtractText_shouldIncludeMetadata() {
        // Given: A simple image
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        // When: Extract text
        OcrResult result = provider.extractText(image);

        // Then: Should include metadata
        assertNotNull(result);
        assertNotNull(result.getMetadata());
        assertTrue(result.getMetadata().containsKey("duration_ms"));
        assertTrue(result.getMetadata().containsKey("text_length"));
    }
}
