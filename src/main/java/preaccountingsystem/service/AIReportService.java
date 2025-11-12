package preaccountingsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import preaccountingsystem.dto.AIReportRequest;
import preaccountingsystem.dto.AIReportResponse;
import preaccountingsystem.entity.Customer;
import preaccountingsystem.entity.Invoice;
import preaccountingsystem.entity.InvoiceType;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.InvoiceRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIReportService {

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${ai.model:claude-3-5-sonnet-20241022}")
    private String model;

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIReportResponse generateReport(AIReportRequest request) {
        try {
            // 1. Verileri topla
            String jsonData = collectDataAsJson(request);

            // 2. Prompt template'i yükle
            String promptTemplate = loadPromptTemplate();

            // 3. Template'i doldur
            String finalPrompt = promptTemplate
                    .replace("{{RAPOR_TURU}}", request.getRaporTuru())
                    .replace("{{DATA}}", jsonData);

            // 4. Claude API'ye istek at
            String aiResponse = callClaudeAPI(finalPrompt);

            // 5. Yanıtı parse et
            return parseAIResponse(aiResponse, request.getRaporTuru());

        } catch (Exception e) {
            log.error("AI rapor oluşturma hatası: ", e);
            return AIReportResponse.builder()
                    .basarili(false)
                    .hata("Rapor oluşturulurken hata oluştu: " + e.getMessage())
                    .build();
        }
    }

    private String collectDataAsJson(AIReportRequest request) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();

        // Firma bilgileri
        ObjectNode firma = objectMapper.createObjectNode();
        firma.put("unvan", request.getFirmaUnvan() != null ? request.getFirmaUnvan() : "Firma Adı Belirtilmedi");
        firma.put("vergi_no", request.getVergiNo() != null ? request.getVergiNo() : "N/A");

        ObjectNode donem = objectMapper.createObjectNode();
        donem.put("baslangic", request.getBaslangicTarihi().toString());
        donem.put("bitis", request.getBitisTarihi().toString());
        firma.set("donem", donem);

        root.set("firma", firma);

        // Parametreler
        ObjectNode parametreler = objectMapper.createObjectNode();
        parametreler.put("rapor_turu", request.getRaporTuru());
        parametreler.put("dil", "tr");
        parametreler.put("para_birimi", "TRY");

        ArrayNode kdvOranlari = objectMapper.createArrayNode();
        kdvOranlari.add(0).add(1).add(10).add(20);
        parametreler.set("kdv_oranlari", kdvOranlari);
        parametreler.put("tahsilat_vadesi_gun", 30);

        if (request.getOzelSorgu() != null && !request.getOzelSorgu().isEmpty()) {
            parametreler.put("ozel_sorgu", request.getOzelSorgu());
        }

        root.set("parametreler", parametreler);

        // Hesap planı (basitleştirilmiş)
        ArrayNode hesapPlani = objectMapper.createArrayNode();
        hesapPlani.add(createHesapNode("600", "Yurt İçi Satışlar"));
        hesapPlani.add(createHesapNode("620", "Satışların Maliyeti"));
        hesapPlani.add(createHesapNode("102", "Bankalar"));
        hesapPlani.add(createHesapNode("120", "Alıcılar"));
        hesapPlani.add(createHesapNode("191", "İndirilecek KDV"));
        hesapPlani.add(createHesapNode("391", "Hesaplanan KDV"));
        root.set("hesap_plani", hesapPlani);

        // Faturalar - Veritabanından çek
        List<Invoice> invoices = invoiceRepository.findByDateBetween(
                request.getBaslangicTarihi(),
                request.getBitisTarihi()
        );

        ArrayNode faturalar = objectMapper.createArrayNode();
        for (Invoice invoice : invoices) {
            ObjectNode fatura = objectMapper.createObjectNode();
            fatura.put("tip", invoice.getType() == InvoiceType.INCOME ? "satis" : "alis");
            fatura.put("no", "FT-" + invoice.getId());
            fatura.put("tarih", invoice.getDate().toString());
            fatura.put("vade_tarihi", invoice.getDate().plusDays(30).toString());

            ObjectNode cari = objectMapper.createObjectNode();
            cari.put("tip", invoice.getType() == InvoiceType.INCOME ? "musteri" : "tedarikci");
            cari.put("ad", invoice.getCustomer().getName());
            cari.put("vergi_no", invoice.getCustomer().getTaxNo() != null ? invoice.getCustomer().getTaxNo() : "N/A");
            fatura.set("cari", cari);

            ArrayNode kalemler = objectMapper.createArrayNode();
            ObjectNode kalem = objectMapper.createObjectNode();
            kalem.put("ad", invoice.getDescription() != null ? invoice.getDescription() : "Hizmet");
            kalem.put("miktar", 1);

            // KDV dahil fiyat olduğunu varsayıyoruz, KDV %20
            BigDecimal matrah = invoice.getAmount().divide(new BigDecimal("1.20"), 2, BigDecimal.ROUND_HALF_UP);
            kalem.put("birim_fiyat", matrah.doubleValue());
            kalem.put("kdv_orani", 20);
            kalem.put("iskonto_orani", 0);
            kalemler.add(kalem);
            fatura.set("kalemler", kalemler);

            fatura.put("para_birimi", "TRY");
            fatura.put("kur", 1.0);
            fatura.put("odeme_durumu", "odendi");

            faturalar.add(fatura);
        }
        root.set("faturalar", faturalar);

        // Boş diziler (şimdilik veri yok)
        root.set("fis_kayitlari", objectMapper.createArrayNode());
        root.set("tahsilat_odeme", objectMapper.createArrayNode());
        root.set("banka_ekstreleri", objectMapper.createArrayNode());
        root.set("butce", objectMapper.createArrayNode());
        root.set("masraflar", objectMapper.createArrayNode());

        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
    }

    private ObjectNode createHesapNode(String kod, String ad) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("kod", kod);
        node.put("ad", ad);
        return node;
    }

    private String loadPromptTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/ai-report-prompt.txt");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private String callClaudeAPI(String prompt) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new BusinessException("AI API key yapılandırılmamış. Lütfen application.yml dosyasında ai.api.key değerini ayarlayın.");
        }

        // Claude API request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 8000);

        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        requestBody.put("messages", List.of(message));

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // API çağrısı
        String response = restTemplate.postForObject(apiUrl, entity, String.class);

        if (response == null) {
            throw new BusinessException("Claude API'den yanıt alınamadı");
        }

        // Response'tan content'i çıkar
        JsonNode jsonResponse = objectMapper.readTree(response);
        JsonNode contentArray = jsonResponse.get("content");

        if (contentArray != null && contentArray.isArray() && contentArray.size() > 0) {
            return contentArray.get(0).get("text").asText();
        }

        throw new BusinessException("Claude API yanıtı beklenmeyen formatta");
    }

    private AIReportResponse parseAIResponse(String aiResponse, String raporTuru) {
        try {
            // AI'ın markdown ve JSON kısmını ayır
            String markdownPart = "";
            String jsonPart = "";

            // JSON kısmını bul (genellikle sonunda olur)
            int jsonStart = aiResponse.indexOf("```json");
            if (jsonStart != -1) {
                int jsonEnd = aiResponse.indexOf("```", jsonStart + 7);
                if (jsonEnd != -1) {
                    jsonPart = aiResponse.substring(jsonStart + 7, jsonEnd).trim();
                    markdownPart = aiResponse.substring(0, jsonStart).trim();
                } else {
                    markdownPart = aiResponse;
                }
            } else {
                // JSON formatı yoksa tüm yanıtı markdown olarak al
                markdownPart = aiResponse;
            }

            return AIReportResponse.builder()
                    .raporTuru(raporTuru)
                    .markdownRapor(markdownPart)
                    .jsonOzet(jsonPart)
                    .basarili(true)
                    .build();

        } catch (Exception e) {
            log.error("AI yanıtı parse edilirken hata: ", e);
            return AIReportResponse.builder()
                    .raporTuru(raporTuru)
                    .markdownRapor(aiResponse)
                    .basarili(true)
                    .build();
        }
    }
}
