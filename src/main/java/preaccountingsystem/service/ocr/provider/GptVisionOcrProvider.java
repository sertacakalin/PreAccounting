package preaccountingsystem.service.ocr.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import preaccountingsystem.dto.OcrResult;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * GPT-4 Vision OCR provider
 * High accuracy, paid API, used as fallback when Tesseract confidence is low
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GptVisionOcrProvider implements OcrProvider {

    private final RestTemplate restTemplate;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    @Override
    public OcrResult extractText(BufferedImage image) {
        log.info("Starting GPT-4 Vision OCR processing");

        try {
            // Resolve API key
            String apiKey = resolveApiKey();
            if (apiKey == null || apiKey.isEmpty()) {
                log.warn("OpenAI API key not configured, skipping GPT-4 Vision OCR");
                return OcrResult.builder()
                    .text("")
                    .confidence(0.0)
                    .providerName(getProviderName())
                    .metadata(Map.of("error", "API key not configured"))
                    .build();
            }

            // Convert image to base64
            long startTime = System.currentTimeMillis();
            String base64Image = imageToBase64(image);

            // Build prompt for OCR
            String prompt = """
                Bu bir iş belgesi (fatura, fiş, makbuz veya sözleşme) görseli.
                Lütfen görseldeki TÜM metni olduğu gibi oku ve döndür.

                KURALLAR:
                - Metni olduğu gibi yaz, hiçbir şey uydurma
                - Sayıları ve tarihleri dikkatli oku
                - Tüm satırları ve alanları dahil et
                - Sadece görünen metni yaz, yorum yapma
                """;

            // Call GPT-4 Vision API
            Map<String, Object> request = buildGptVisionRequest(base64Image, prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );

            long duration = System.currentTimeMillis() - startTime;

            // Extract text from response
            String text = extractTextFromResponse(response.getBody());

            log.info("GPT-4 Vision OCR completed. Duration: {}ms, Text length: {}",
                duration, text.length());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("duration_ms", duration);
            metadata.put("text_length", text.length());
            metadata.put("model", "gpt-4-vision-preview");

            return OcrResult.builder()
                .text(text)
                .confidence(0.95) // GPT-4 Vision has high confidence
                .providerName(getProviderName())
                .metadata(metadata)
                .build();

        } catch (Exception e) {
            log.error("GPT-4 Vision OCR failed", e);

            return OcrResult.builder()
                .text("")
                .confidence(0.0)
                .providerName(getProviderName())
                .metadata(Map.of("error", e.getMessage()))
                .build();
        }
    }

    /**
     * Convert BufferedImage to base64 string
     */
    private String imageToBase64(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        byte[] bytes = baos.toByteArray();
        return Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Build GPT-4 Vision API request
     */
    private Map<String, Object> buildGptVisionRequest(String base64Image, String prompt) {
        Map<String, Object> request = new HashMap<>();
        request.put("model", "gpt-4-vision-preview");
        request.put("max_tokens", 1000);

        List<Map<String, Object>> messages = List.of(
            Map.of(
                "role", "user",
                "content", List.of(
                    Map.of("type", "text", "text", prompt),
                    Map.of(
                        "type", "image_url",
                        "image_url", Map.of(
                            "url", "data:image/jpeg;base64," + base64Image,
                            "detail", "high"
                        )
                    )
                )
            )
        );

        request.put("messages", messages);

        return request;
    }

    /**
     * Extract text from GPT-4 Vision API response
     */
    private String extractTextFromResponse(Map response) {
        try {
            return Optional.ofNullable(response)
                .map(r -> r.get("choices"))
                .filter(List.class::isInstance)
                .map(List.class::cast)
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0))
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(choice -> choice.get("message"))
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(message -> message.get("content"))
                .map(Object::toString)
                .orElse("");
        } catch (Exception e) {
            log.error("Failed to parse GPT response", e);
            return "";
        }
    }

    /**
     * Resolve API key from configuration or environment
     */
    private String resolveApiKey() {
        String key = openAiApiKey;
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("OPENAI_API_KEY");
        }
        if (key == null) {
            return "";
        }
        key = key.trim();
        // Remove quotes if present
        if (key.startsWith("\"") && key.endsWith("\"") && key.length() > 1) {
            key = key.substring(1, key.length() - 1).trim();
        }
        // Remove Bearer prefix if present
        if (key.toLowerCase().startsWith("bearer ")) {
            key = key.substring(7).trim();
        }
        return key;
    }

    @Override
    public String getProviderName() {
        return "GPT-4 Vision";
    }

    @Override
    public int getPriority() {
        return 2; // Use as fallback (paid API)
    }
}
