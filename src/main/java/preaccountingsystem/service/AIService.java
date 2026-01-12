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

    // YENİ: docker-compose.yml dosyasından API anahtarını çeker
    @Value("${OPENAI_API_KEY}")
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

        // DEĞİŞİKLİK: Artık "Mock" (sahte) cevap yerine GERÇEK AI çağırılıyor
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

        // Calculate remaining queries
        Map<String, Long> usageStats = getUsageStatsCounts(companyId);
        Integer remainingDaily = (int) (settings.getAiDailyLimit() - usageStats.get("daily") - 1);
        Integer remainingMonthly = (int) (settings.getAiMonthlyLimit() - usageStats.get("monthly") - 1);

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
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey); // API Anahtarını ekler

            // AI'ya gönderilecek talimat (Prompt)
            String prompt = "Sen profesyonel bir ön muhasebe asistanısın. " +
                    "Aşağıdaki şirket verilerine dayanarak kullanıcının sorusunu yanıtla. " +
                    "Cevabın Türkçe, net ve finansal açıdan tutarlı olsun. " +
                    "VERİLER:\n" + contextData + "\n\n" +
                    "SORU: " + userQuery;

            // JSON Gövdesini oluşturma
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo"); // Hızlı ve ucuz model

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "Sen yardımcı bir finans uzmanısın."));
            messages.add(Map.of("role", "user", "content", prompt));

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // İsteği gönder
            Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, entity, Map.class);

            // Cevabı ayıkla (JSON parsing)
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "AI servisine ulaşıldı ancak anlamlı bir cevap alınamadı.";

        } catch (Exception e) {
            e.printStackTrace();
            // Hata durumunda kullanıcıya bilgi ver
            return "AI Servisi şu an yanıt veremiyor. Lütfen API anahtarınızı kontrol edin veya daha sonra deneyin. Hata: " + e.getMessage();
        }
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

    private Integer estimateTokens(String query, String response) {
        int totalChars = (query != null ? query.length() : 0) + (response != null ? response.length() : 0);
        return (int) Math.ceil(totalChars / 4.0);
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