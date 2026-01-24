package preaccountingsystem.service.extraction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import preaccountingsystem.dto.DocumentFields;
import preaccountingsystem.dto.InvoiceItemData;
import preaccountingsystem.entity.DocumentType;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for extracting structured fields from OCR text using AI
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IntelligentFieldExtractor {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    /**
     * Extract structured fields from OCR text
     *
     * @param ocrText OCR extracted text
     * @param documentType Type of document
     * @return Extracted fields with confidence scores
     */
    public DocumentFields extractFields(String ocrText, DocumentType documentType) {
        log.info("Extracting fields. Document type: {}, Text length: {}",
            documentType, ocrText != null ? ocrText.length() : 0);

        if (ocrText == null || ocrText.trim().isEmpty()) {
            log.warn("Empty OCR text, returning empty fields");
            return buildEmptyFields(ocrText);
        }

        try {
            // Build extraction prompt based on document type
            String prompt = buildExtractionPrompt(ocrText, documentType);

            // Call GPT-4 for field extraction
            String jsonResponse = callGPT4(prompt);

            // Parse JSON response to DocumentFields
            DocumentFields fields = parseFieldsFromJson(jsonResponse);
            fields.setRawOcrText(ocrText);

            // Calculate confidence scores
            calculateConfidences(fields, ocrText);

            log.info("Field extraction complete. Overall confidence: {}", fields.getOverallConfidence());

            return fields;

        } catch (Exception e) {
            log.error("Field extraction failed", e);
            return buildEmptyFields(ocrText);
        }
    }

    /**
     * Build extraction prompt based on document type
     */
    private String buildExtractionPrompt(String text, DocumentType type) {
        String basePrompt = """
            Aşağıdaki metin bir %s belgesinden OCR ile okunmuştur.
            Lütfen aşağıdaki bilgileri çıkar ve JSON formatında döndür.

            OCR Metni:
            %s

            """;

        String schema = switch (type) {
            case INVOICE -> """
                JSON şeması:
                {
                    "companyName": "Şirket adı (varsa)",
                    "date": "DD/MM/YYYY formatında tarih",
                    "documentNumber": "Fatura numarası",
                    "totalAmount": 0.00,
                    "vatAmount": 0.00,
                    "currency": "TRY veya USD veya EUR",
                    "taxId": "Vergi numarası",
                    "address": "Adres",
                    "items": [
                        {
                            "name": "Ürün/hizmet adı",
                            "quantity": 1,
                            "unitPrice": 0.00,
                            "totalPrice": 0.00,
                            "description": "Açıklama"
                        }
                    ]
                }
                """;
            case RECEIPT -> """
                JSON şeması:
                {
                    "companyName": "Mağaza/işletme adı",
                    "date": "DD/MM/YYYY formatında tarih",
                    "documentNumber": "Fiş numarası",
                    "totalAmount": 0.00,
                    "currency": "TRY",
                    "address": "Adres"
                }
                """;
            case BANK_STATEMENT -> """
                JSON şeması:
                {
                    "companyName": "Banka adı",
                    "date": "DD/MM/YYYY formatında tarih",
                    "documentNumber": "İşlem numarası/referans no",
                    "totalAmount": 0.00,
                    "currency": "TRY",
                    "description": "İşlem açıklaması"
                }
                """;
            default -> """
                JSON şeması:
                {
                    "companyName": "Şirket/kurum adı",
                    "date": "DD/MM/YYYY formatında tarih",
                    "documentNumber": "Belge numarası",
                    "totalAmount": 0.00,
                    "currency": "TRY",
                    "description": "Açıklama"
                }
                """;
        };

        String rules = """

            KURALLAR:
            - Eğer bir alan bulamazsan, null yaz (uydurmaya çalışma!)
            - Sayıları nokta (.) ile ayır, virgül kullanma (örn: 1500.00)
            - Tarihi mutlaka DD/MM/YYYY formatında yaz
            - Para birimi TRY, USD, EUR veya GBP olsun
            - Sadece JSON döndür, başka açıklama yazma
            - JSON içinde Türkçe karakter kullanabilirsin
            """;

        return String.format(basePrompt, type.getDisplayName(), text) + schema + rules;
    }

    /**
     * Call GPT-4 API for field extraction
     */
    private String callGPT4(String prompt) {
        try {
            String apiKey = resolveApiKey();
            if (apiKey == null || apiKey.isEmpty()) {
                log.warn("OpenAI API key not configured, using fallback extraction");
                return buildFallbackJson();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("temperature", 0.0); // Deterministic for extraction

            List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                    "You are an expert at extracting structured data from business documents."),
                Map.of("role", "user", "content", prompt)
            );

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );

            // Extract text from response
            String text = Optional.ofNullable(response.getBody())
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
                .orElse(buildFallbackJson());

            return text;

        } catch (Exception e) {
            log.error("GPT-4 API call failed", e);
            return buildFallbackJson();
        }
    }

    /**
     * Parse JSON response to DocumentFields
     */
    private DocumentFields parseFieldsFromJson(String jsonResponse) {
        try {
            // Clean JSON (GPT sometimes wraps in ```json ... ```)
            String cleanJson = jsonResponse
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();

            JsonNode node = objectMapper.readTree(cleanJson);

            DocumentFields.DocumentFieldsBuilder builder = DocumentFields.builder();

            // Extract fields
            if (node.has("companyName") && !node.get("companyName").isNull()) {
                builder.companyName(node.get("companyName").asText());
            }

            if (node.has("date") && !node.get("date").isNull()) {
                builder.date(node.get("date").asText());
            }

            if (node.has("documentNumber") && !node.get("documentNumber").isNull()) {
                builder.documentNumber(node.get("documentNumber").asText());
            }

            if (node.has("totalAmount") && !node.get("totalAmount").isNull()) {
                builder.totalAmount(node.get("totalAmount").asDouble());
            }

            if (node.has("vatAmount") && !node.get("vatAmount").isNull()) {
                builder.vatAmount(node.get("vatAmount").asDouble());
            }

            if (node.has("currency") && !node.get("currency").isNull()) {
                builder.currency(node.get("currency").asText());
            }

            if (node.has("taxId") && !node.get("taxId").isNull()) {
                builder.taxId(node.get("taxId").asText());
            }

            if (node.has("address") && !node.get("address").isNull()) {
                builder.address(node.get("address").asText());
            }

            if (node.has("description") && !node.get("description").isNull()) {
                builder.description(node.get("description").asText());
            }

            // Parse items array
            if (node.has("items") && node.get("items").isArray()) {
                List<InvoiceItemData> items = new ArrayList<>();
                for (JsonNode itemNode : node.get("items")) {
                    InvoiceItemData item = InvoiceItemData.builder()
                        .name(itemNode.has("name") ? itemNode.get("name").asText() : null)
                        .quantity(itemNode.has("quantity") ? itemNode.get("quantity").asInt() : null)
                        .unitPrice(itemNode.has("unitPrice") ? itemNode.get("unitPrice").asDouble() : null)
                        .totalPrice(itemNode.has("totalPrice") ? itemNode.get("totalPrice").asDouble() : null)
                        .description(itemNode.has("description") ? itemNode.get("description").asText() : null)
                        .build();
                    items.add(item);
                }
                builder.items(items);
            }

            return builder.build();

        } catch (Exception e) {
            log.error("Failed to parse JSON response", e);
            return DocumentFields.builder().build();
        }
    }

    /**
     * Calculate confidence scores for extracted fields
     */
    private void calculateConfidences(DocumentFields fields, String ocrText) {
        String lowerOcr = ocrText.toLowerCase();

        // Company name confidence
        if (fields.getCompanyName() != null) {
            double conf = fuzzyMatch(fields.getCompanyName(), ocrText);
            fields.setCompanyNameConfidence(conf);
        } else {
            fields.setCompanyNameConfidence(0.0);
        }

        // Date confidence
        if (fields.getDate() != null) {
            boolean valid = isValidDate(fields.getDate());
            boolean existsInOcr = ocrText.contains(fields.getDate());
            fields.setDateConfidence(valid && existsInOcr ? 0.95 : (valid ? 0.7 : 0.3));
        } else {
            fields.setDateConfidence(0.0);
        }

        // Document number confidence
        if (fields.getDocumentNumber() != null) {
            double conf = fuzzyMatch(fields.getDocumentNumber(), ocrText);
            fields.setDocumentNumberConfidence(conf);
        } else {
            fields.setDocumentNumberConfidence(0.0);
        }

        // Total amount confidence
        if (fields.getTotalAmount() != null) {
            boolean reasonable = fields.getTotalAmount() > 0 && fields.getTotalAmount() < 1000000;
            fields.setTotalAmountConfidence(reasonable ? 0.9 : 0.4);
        } else {
            fields.setTotalAmountConfidence(0.0);
        }

        // VAT amount confidence
        if (fields.getVatAmount() != null) {
            boolean reasonable = fields.getVatAmount() >= 0;
            fields.setVatAmountConfidence(reasonable ? 0.8 : 0.3);
        } else {
            fields.setVatAmountConfidence(0.0);
        }

        // Currency confidence
        if (fields.getCurrency() != null) {
            boolean valid = List.of("TRY", "USD", "EUR", "GBP").contains(fields.getCurrency().toUpperCase());
            fields.setCurrencyConfidence(valid ? 0.95 : 0.5);
        } else {
            fields.setCurrencyConfidence(0.0);
        }

        // Calculate overall confidence
        double sum = 0;
        int count = 0;

        Double[] confidences = {
            fields.getCompanyNameConfidence(),
            fields.getDateConfidence(),
            fields.getTotalAmountConfidence(),
            fields.getCurrencyConfidence()
        };

        for (Double conf : confidences) {
            if (conf != null && conf > 0) {
                sum += conf;
                count++;
            }
        }

        fields.setOverallConfidence(count > 0 ? sum / count : 0.0);
    }

    /**
     * Fuzzy match string in source text
     */
    private double fuzzyMatch(String extracted, String source) {
        if (extracted == null || extracted.trim().isEmpty()) {
            return 0.0;
        }

        // Exact match
        if (source.contains(extracted)) {
            return 1.0;
        }

        // Case-insensitive match
        if (source.toLowerCase().contains(extracted.toLowerCase())) {
            return 0.95;
        }

        // Partial match
        String[] words = extracted.split("\\s+");
        int matches = 0;
        for (String word : words) {
            if (word.length() > 3 && source.toLowerCase().contains(word.toLowerCase())) {
                matches++;
            }
        }

        if (words.length > 0) {
            return Math.min(0.9, (double) matches / words.length);
        }

        return 0.3;
    }

    /**
     * Validate date format
     */
    private boolean isValidDate(String date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            LocalDate.parse(date, formatter);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Build fallback JSON when API fails
     */
    private String buildFallbackJson() {
        return """
            {
                "companyName": null,
                "date": null,
                "documentNumber": null,
                "totalAmount": null,
                "vatAmount": null,
                "currency": null
            }
            """;
    }

    /**
     * Build empty fields object
     */
    private DocumentFields buildEmptyFields(String ocrText) {
        return DocumentFields.builder()
            .rawOcrText(ocrText)
            .overallConfidence(0.0)
            .build();
    }

    /**
     * Resolve API key
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
        if (key.startsWith("\"") && key.endsWith("\"") && key.length() > 1) {
            key = key.substring(1, key.length() - 1).trim();
        }
        if (key.toLowerCase().startsWith("bearer ")) {
            key = key.substring(7).trim();
        }
        return key;
    }
}
