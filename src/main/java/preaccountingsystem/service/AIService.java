package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public AIQueryResponse processQuery(AIQueryRequest request, Long companyId, User user) {
        // Validate company exists
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        // Get system settings for AI limits
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseThrow(() -> new BusinessException("System settings not found"));

        // Check daily limit
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        Long dailyUsage = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfDay);

        if (dailyUsage >= settings.getAiDailyLimit()) {
            throw new BusinessException("Daily AI query limit reached. Limit: " + settings.getAiDailyLimit());
        }

        // Check monthly limit
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        Long monthlyUsage = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfMonth);

        if (monthlyUsage >= settings.getAiMonthlyLimit()) {
            throw new BusinessException("Monthly AI query limit reached. Limit: " + settings.getAiMonthlyLimit());
        }

        // Build context from company data (last 30 days)
        String context = buildContext(companyId);

        // Generate mock AI response
        String aiResponse = generateMockAIResponse(request.getQuery(), context);

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
        Integer remainingDaily = settings.getAiDailyLimit() - dailyUsage.intValue() - 1;
        Integer remainingMonthly = settings.getAiMonthlyLimit() - monthlyUsage.intValue() - 1;

        return AIQueryResponse.builder()
                .response(aiResponse)
                .timestamp(LocalDateTime.now())
                .remainingDailyQueries(remainingDaily)
                .remainingMonthlyQueries(remainingMonthly)
                .limitReached(remainingDaily <= 0 || remainingMonthly <= 0)
                .build();
    }

    private String buildContext(Long companyId) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        StringBuilder context = new StringBuilder();
        context.append("Company Data Summary (Last 30 Days):\n\n");

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

        context.append(String.format("Total Income: %s\n", totalIncome));
        context.append(String.format("Total Expense: %s\n", totalExpense));
        context.append(String.format("Net Profit: %s\n\n", totalIncome.subtract(totalExpense)));

        // Expense by category
        Map<String, BigDecimal> expensesByCategory = incomeExpenses.stream()
                .filter(ie -> ie.getCategory().getType() == CategoryType.EXPENSE)
                .collect(Collectors.groupingBy(
                        ie -> ie.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, IncomeExpense::getAmount, BigDecimal::add)
                ));

        if (!expensesByCategory.isEmpty()) {
            context.append("Expenses by Category:\n");
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

        context.append(String.format("Total Invoices: %d\n", invoices.size()));
        context.append(String.format("Unpaid Invoices: %d\n", unpaidInvoices));
        context.append(String.format("Unpaid Amount: %s\n\n", unpaidAmount));

        // Customer/Supplier count
        List<CustomerSupplier> customers = customerSupplierRepository.findByCompanyIdAndIsCustomerTrue(companyId);
        List<CustomerSupplier> suppliers = customerSupplierRepository.findByCompanyIdAndIsCustomerFalse(companyId);

        context.append(String.format("Total Customers: %d\n", customers.size()));
        context.append(String.format("Total Suppliers: %d\n", suppliers.size()));

        return context.toString();
    }

    private String generateMockAIResponse(String query, String context) {
        // Mock AI response - in production, this would call a real AI service
        StringBuilder response = new StringBuilder();

        response.append("Based on your company data from the last 30 days, here's what I found:\n\n");

        String queryLower = query.toLowerCase();

        if (queryLower.contains("income") || queryLower.contains("revenue")) {
            response.append("Regarding your income: I can see your recent income and expense trends. ");
            response.append("Check the dashboard for detailed monthly breakdowns and category analysis.\n\n");
        } else if (queryLower.contains("expense") || queryLower.contains("cost")) {
            response.append("Regarding your expenses: I've analyzed your spending patterns across categories. ");
            response.append("The expense distribution shows where your money is going.\n\n");
        } else if (queryLower.contains("invoice") || queryLower.contains("payment")) {
            response.append("Regarding invoices and payments: I can help you track unpaid invoices and payment status. ");
            response.append("Check the unpaid invoices section for details on outstanding amounts.\n\n");
        } else if (queryLower.contains("profit") || queryLower.contains("loss")) {
            response.append("Regarding profitability: I've calculated your net profit based on income minus expenses. ");
            response.append("Review the monthly trends to see how your profit changes over time.\n\n");
        } else {
            response.append("I've analyzed your recent business data. ");
            response.append("Here are some insights based on the available information:\n\n");
        }

        response.append("Context Summary:\n");
        response.append(context);
        response.append("\n");
        response.append("Note: This is a mock AI response. In production, this would be powered by a real AI service ");
        response.append("that can provide detailed analysis, predictions, and recommendations based on your data.");

        return response.toString();
    }

    private Integer estimateTokens(String query, String response) {
        // Simple token estimation: roughly 1 token per 4 characters
        int totalChars = query.length() + response.length();
        return (int) Math.ceil(totalChars / 4.0);
    }

    @Transactional(readOnly = true)
    public List<AIAuditLog> getCompanyUsageHistory(Long companyId) {
        return aiAuditLogRepository.findByCompanyIdOrderByTimestampDesc(companyId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUsageStats(Long companyId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();

        Long dailyUsage = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfDay);
        Long monthlyUsage = aiAuditLogRepository.countByCompanyIdAndTimestampAfter(companyId, startOfMonth);

        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseThrow(() -> new BusinessException("System settings not found"));

        return Map.of(
                "dailyUsage", dailyUsage,
                "dailyLimit", settings.getAiDailyLimit().longValue(),
                "monthlyUsage", monthlyUsage,
                "monthlyLimit", settings.getAiMonthlyLimit().longValue()
        );
    }
}
