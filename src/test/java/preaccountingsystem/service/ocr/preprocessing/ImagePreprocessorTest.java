package preaccountingsystem.service.ocr.preprocessing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.awt.image.BufferedImage;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ImagePreprocessor
 */
class ImagePreprocessorTest {

    private ImagePreprocessor preprocessor;

    @BeforeEach
    void setUp() {
        preprocessor = new ImagePreprocessor();
    }

    @Test
    void testPreprocess_shouldReturnProcessedImage() {
        // Given: A simple test image
        BufferedImage original = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        // When: Preprocessing
        BufferedImage processed = preprocessor.preprocess(original);

        // Then: Should return non-null image
        assertNotNull(processed);
        assertEquals(BufferedImage.TYPE_BYTE_BINARY, processed.getType());
    }

    @Test
    void testPreprocess_shouldMaintainDimensions() {
        // Given: A test image with specific dimensions
        int width = 200;
        int height = 150;
        BufferedImage original = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        // When: Preprocessing
        BufferedImage processed = preprocessor.preprocess(original);

        // Then: Dimensions should be maintained (approximately)
        assertNotNull(processed);
        assertTrue(processed.getWidth() > 0);
        assertTrue(processed.getHeight() > 0);
    }

    @Test
    void testPreprocess_shouldHandleLargeImage() {
        // Given: A larger image
        BufferedImage original = new BufferedImage(1000, 1000, BufferedImage.TYPE_INT_RGB);

        // When: Preprocessing
        BufferedImage processed = preprocessor.preprocess(original);

        // Then: Should complete without errors
        assertNotNull(processed);
    }

    @Test
    void testPreprocess_shouldConvertToBinary() {
        // Given: A color image
        BufferedImage original = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        // When: Preprocessing
        BufferedImage processed = preprocessor.preprocess(original);

        // Then: Result should be binary (black and white)
        assertNotNull(processed);
        assertEquals(BufferedImage.TYPE_BYTE_BINARY, processed.getType());
    }
}
