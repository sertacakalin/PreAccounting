package preaccountingsystem.service.ocr;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import preaccountingsystem.dto.OcrResult;
import preaccountingsystem.exception.OcrException;
import preaccountingsystem.service.ocr.preprocessing.ImagePreprocessor;
import preaccountingsystem.service.ocr.provider.OcrProvider;

import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OcrOrchestrator
 */
@ExtendWith(MockitoExtension.class)
class OcrOrchestratorTest {

    @Mock
    private OcrProvider provider1;

    @Mock
    private OcrProvider provider2;

    @Mock
    private ImagePreprocessor preprocessor;

    private OcrOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        // Setup provider priorities
        when(provider1.getPriority()).thenReturn(1);
        when(provider1.getProviderName()).thenReturn("Provider1");

        when(provider2.getPriority()).thenReturn(2);
        when(provider2.getProviderName()).thenReturn("Provider2");
    }

    @Test
    void testProcessDocument_noProviders_shouldThrowException() {
        // Given: No providers
        orchestrator = new OcrOrchestrator(Collections.emptyList(), preprocessor);
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        when(preprocessor.preprocess(any())).thenReturn(image);

        // When/Then: Should throw exception
        assertThrows(OcrException.class, () -> orchestrator.processDocument(image));
    }

    @Test
    void testProcessDocument_firstProviderSucceeds_shouldReturnResult() {
        // Given: First provider returns high confidence
        List<OcrProvider> providers = Arrays.asList(provider1, provider2);
        orchestrator = new OcrOrchestrator(providers, preprocessor);

        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        when(preprocessor.preprocess(any())).thenReturn(image);

        OcrResult result1 = OcrResult.builder()
            .text("Test text")
            .confidence(0.9)
            .providerName("Provider1")
            .build();

        when(provider1.extractText(any())).thenReturn(result1);

        // When
        OcrResult result = orchestrator.processDocument(image);

        // Then: Should return first provider's result
        assertNotNull(result);
        assertEquals("Test text", result.getText());
        assertEquals(0.9, result.getConfidence());
        assertEquals("Provider1", result.getProviderName());

        // Provider2 should not be called
        verify(provider2, never()).extractText(any());
    }

    @Test
    void testProcessDocument_firstProviderLowConfidence_shouldTrySecond() {
        // Given: First provider returns low confidence, second returns high
        List<OcrProvider> providers = Arrays.asList(provider1, provider2);
        orchestrator = new OcrOrchestrator(providers, preprocessor);

        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        when(preprocessor.preprocess(any())).thenReturn(image);

        OcrResult result1 = OcrResult.builder()
            .text("Low confidence text")
            .confidence(0.5)
            .providerName("Provider1")
            .build();

        OcrResult result2 = OcrResult.builder()
            .text("High confidence text")
            .confidence(0.95)
            .providerName("Provider2")
            .build();

        when(provider1.extractText(any())).thenReturn(result1);
        when(provider2.extractText(any())).thenReturn(result2);

        // When
        OcrResult result = orchestrator.processDocument(image);

        // Then: Should return second provider's result
        assertNotNull(result);
        assertEquals("High confidence text", result.getText());
        assertEquals(0.95, result.getConfidence());
        assertEquals("Provider2", result.getProviderName());

        // Both providers should be called
        verify(provider1, times(1)).extractText(any());
        verify(provider2, times(1)).extractText(any());
    }

    @Test
    void testProcessDocument_allProvidersLowConfidence_shouldReturnBestResult() {
        // Given: All providers return low confidence
        List<OcrProvider> providers = Arrays.asList(provider1, provider2);
        orchestrator = new OcrOrchestrator(providers, preprocessor);

        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        when(preprocessor.preprocess(any())).thenReturn(image);

        OcrResult result1 = OcrResult.builder()
            .text("Text 1")
            .confidence(0.4)
            .providerName("Provider1")
            .build();

        OcrResult result2 = OcrResult.builder()
            .text("Text 2")
            .confidence(0.6)
            .providerName("Provider2")
            .build();

        when(provider1.extractText(any())).thenReturn(result1);
        when(provider2.extractText(any())).thenReturn(result2);

        // When
        OcrResult result = orchestrator.processDocument(image);

        // Then: Should return last provider's result
        assertNotNull(result);
        assertEquals("Text 2", result.getText());
        assertEquals("Provider2", result.getProviderName());
    }

    @Test
    void testGetMinConfidenceThreshold() {
        List<OcrProvider> providers = Arrays.asList(provider1);
        orchestrator = new OcrOrchestrator(providers, preprocessor);

        assertEquals(0.7, orchestrator.getMinConfidenceThreshold());
    }
}
