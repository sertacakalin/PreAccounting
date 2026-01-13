package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // YENİ: API Key okumak için
import org.springframework.http.HttpEntity; // YENİ: İstek gövdesi için
import org.springframework.http.HttpHeaders; // YENİ: Header ayarları için
import org.springframework.http.MediaType; // YENİ: JSON tipi için
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate; // YENİ: API'ye istek atmak için
import preaccountingsystem.dto.AIQueryRequest;
import preaccountingsystem.dto.AIQueryResponse;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList; // YENİ
import java.util.HashMap; // YENİ
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

    private final AIAuditLogRepository aiAuditLogRepository;
    private final SystemSettingsRepository systemSettingsRepository;
    private final CustomerRepository customerRepository;
    private final IncomeExpenseRepository incomeExpenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerSupplierRepository customerSupplierRepository;

    // YENİ: Dış dünyaya (OpenAI) istek atmak için araç
    private final RestTemplate restTemplate = new RestTemplate();

    // YENİ: application.yml veya environment variable'dan API anahtarını çeker
    @Value("${openai.api-key:}")
    private String openAiApiKey;

    // YENİ: OpenAI bağlantı adresi
    private final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";


    @Transactional
    public AIQueryResponse processQuery(AIQueryRequest request, Long companyId, User user) {
        // Validate company exists
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        // Get system settings
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseThrow(() -> new BusinessException("System settings not found"));

        // DEĞİŞİKLİK: Limit kontrollerini ayrı metoda taşıdım (kod temizliği için)
        checkLimits(companyId, settings);

        // Build context from company data
        String context = buildContext(companyId);

        // Call AI service
        String aiResponse = callOpenAI(request.getQuery(), context);

        // Log AI usage
        AIAuditLog auditLog = AIAuditLog.builder()
                .query(request.getQuery())
                .response(aiResponse)
                .tokensUsed(estimateTokens(request.getQuery(), aiResponse))
                .user(user)
                .company(company)
                .build();
        aiAuditLogRepository.save(auditLog);

        // Calculate remaining queries AFTER saving the current one
        Map<String, Long> usageStats = getUsageStatsCounts(companyId);
        Integer remainingDaily = (int) (settings.getAiDailyLimit() - usageStats.get("daily"));
        Integer remainingMonthly = (int) (settings.getAiMonthlyLimit() - usageStats.get("monthly"));

        return AIQueryResponse.builder()
                .response(aiResponse)
                .timestamp(LocalDateTime.now())
                .remainingDailyQueries(Math.max(0, remainingDaily))
                .remainingMonthlyQueries(Math.max(0, remainingMonthly))
                .limitReached(remainingDaily <= 0 || remainingMonthly <= 0)
                .build();
    }

    // YENİ METOT: Gerçek OpenAI API çağrısı yapan kısım
    private String callOpenAI(String userQuery, String contextData) {
        try {
            // API anahtarı kontrolü
            String apiKey = resolveApiKey();
            if (apiKey.isEmpty()) {
                return "HATA: OpenAI API anahtarı yapılandırılmamış. Lütfen sistem yöneticinizle iletişime geçin.";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // JSON Gövdesini oluşturma
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");

            List<Map<String, String>> messages = new ArrayList<>();
            // Single professional system instruction
            messages.add(Map.of("role", "system", "content",
                    "You are a professional financial expert and pre-accounting assistant."));
            // Data and query
            messages.add(Map.of("role", "user", "content",
                    "DATA:\n" + contextData + "\n\nQUESTION: " + userQuery));

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // İsteği gönder
            Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, entity, Map.class);

            // Cevabı ayıkla (JSON parsing) with null-safe Optional approach
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
                    .orElse("AI servisine ulaşıldı ancak anlamlı bir cevap alınamadı.");

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            return "AI Servisi hatası: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "AI Servisi şu an yanıt veremiyor. Hata: " + e.getMessage();
        }
    }

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

    // YENİ: Kod tekrarını önlemek için limit kontrolünü buraya aldım
    private void checkLimits(Long companyId, SystemSettings settings) {
        Map<String, Long> usage = getUsageStatsCounts(companyId);

        if (usage.get("daily") >= settings.getAiDailyLimit()) {
            throw new BusinessException("Günlük AI sorgu limitine ulaşıldı. Limit: " + settings.getAiDailyLimit());
        }

        if (usage.get("monthly") >= settings.getAiMonthlyLimit()) {
            throw new BusinessException("Aylık AI sorgu limitine ulaşıldı. Limit: " + settings.getAiMonthlyLimit());
        }
    }

    // YENİ: Kullanım sayılarını hesaplayan yardımcı metot
    private Map<String, Long> getUsageStatsCounts(Long companyId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();

        Long daily = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfDay);
        Long monthly = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfMonth);

        Map<String, Long> stats = new HashMap<>();
        stats.put("daily", daily);
        stats.put("monthly", monthly);
        return stats;
    }

    // DEĞİŞİKLİK YOK: Context oluşturma mantığın gayet güzeldi, aynen korudum.
    private String buildContext(Long companyId) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        StringBuilder context = new StringBuilder();
        context.append("Şirket Veri Özeti (Son 30 Gün):\n\n");

        // Income/Expense Summary
        List<IncomeExpense> incomeExpenses = incomeExpenseRepository.findByCompanyIdAndDateBetween(
                companyId, thirtyDaysAgo, today);

        BigDecimal totalIncome = incomeExpenses.stream()
                .filter(ie -> ie.getCategory().getType() == CategoryType.INCOME)
                .map(IncomeExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = incomeExpenses.stream()
                .filter(ie -> ie.getCategory().getType() == CategoryType.EXPENSE)
                .map(IncomeExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        context.append(String.format("Toplam Gelir: %s\n", totalIncome));
        context.append(String.format("Toplam Gider: %s\n", totalExpense));
        context.append(String.format("Net Kar: %s\n\n", totalIncome.subtract(totalExpense)));

        // Expense by category
        Map<String, BigDecimal> expensesByCategory = incomeExpenses.stream()
                .filter(ie -> ie.getCategory().getType() == CategoryType.EXPENSE)
                .collect(Collectors.groupingBy(
                        ie -> ie.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, IncomeExpense::getAmount, BigDecimal::add)
                ));

        if (!expensesByCategory.isEmpty()) {
            context.append("Kategori Bazlı Giderler:\n");
            expensesByCategory.forEach((category, amount) ->
                    context.append(String.format("- %s: %s\n", category, amount)));
            context.append("\n");
        }

        // Invoice summary
        List<Invoice> invoices = invoiceRepository.findByCompanyId(companyId);
        long unpaidInvoices = invoices.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.UNPAID)
                .count();
        BigDecimal unpaidAmount = invoices.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.UNPAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        context.append(String.format("Toplam Fatura Sayısı: %d\n", invoices.size()));
        context.append(String.format("Ödenmemiş Fatura Sayısı: %d\n", unpaidInvoices));
        context.append(String.format("Ödenmemiş Toplam Tutar: %s\n\n", unpaidAmount));

        return context.toString();
    }

    /**
     * Estimates tokens for usage tracking. This is a rough approximation.
     * Turkish text typically uses ~3 chars per token due to UTF-8 encoding.
     * For accurate tracking, consider using OpenAI's tiktoken library or the actual
     * token count returned in the API response (usage.total_tokens).
     */
    private Integer estimateTokens(String query, String response) {
        int totalChars = (query != null ? query.length() : 0) + (response != null ? response.length() : 0);
        // Turkish token estimation: ~3 chars per token
        return (int) Math.ceil(totalChars / 3.0);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUsageStats(Long companyId) {
        Map<String, Long> counts = getUsageStatsCounts(companyId);
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseThrow(() -> new BusinessException("System settings not found"));

        return Map.of(
                "dailyUsage", counts.get("daily"),
                "dailyLimit", settings.getAiDailyLimit().longValue(),
                "monthlyUsage", counts.get("monthly"),
                "monthlyLimit", settings.getAiMonthlyLimit().longValue()
        );
    }
}
