package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IncomeExpenseRepository incomeExpenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public DashboardDto getDashboard(Long companyId, LocalDate startDate, LocalDate endDate) {
        customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        BigDecimal totalIncome = incomeExpenseRepository.sumByCompanyIdAndCategoryTypeAndDateBetween(
                companyId, CategoryType.INCOME, startDate, endDate);
        BigDecimal totalExpense = incomeExpenseRepository.sumByCompanyIdAndCategoryTypeAndDateBetween(
                companyId, CategoryType.EXPENSE, startDate, endDate);
        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        List<MonthlyIncomeExpenseDto> monthlyData = getMonthlyIncomeExpense(companyId, startDate, endDate);

        List<ExpenseDistributionDto> expenseDistribution = getExpenseDistribution(companyId, startDate, endDate);

        List<UnpaidInvoiceSummaryDto> unpaidInvoices = getUnpaidInvoices(companyId);

        Integer totalUnpaidInvoices = unpaidInvoices.size();
        BigDecimal totalUnpaidAmount = unpaidInvoices.stream()
                .map(UnpaidInvoiceSummaryDto::getRemainingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netProfit(netProfit)
                .totalUnpaidInvoices(totalUnpaidInvoices)
                .totalUnpaidAmount(totalUnpaidAmount)
                .monthlyData(monthlyData)
                .expenseDistribution(expenseDistribution)
                .unpaidInvoices(unpaidInvoices)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MonthlyIncomeExpenseDto> getMonthlyIncomeExpense(Long companyId, LocalDate startDate, LocalDate endDate) {
        List<IncomeExpense> records = incomeExpenseRepository.findByCompanyIdAndDateBetween(
                companyId, startDate, endDate);

        Map<YearMonth, Map<CategoryType, BigDecimal>> monthlyMap = new TreeMap<>();

        for (IncomeExpense record : records) {
            YearMonth month = YearMonth.from(record.getDate());
            monthlyMap.putIfAbsent(month, new HashMap<>());

            CategoryType type = record.getCategory().getType();
            BigDecimal currentAmount = monthlyMap.get(month).getOrDefault(type, BigDecimal.ZERO);
            monthlyMap.get(month).put(type, currentAmount.add(record.getAmount()));
        }

        return monthlyMap.entrySet().stream()
                .map(entry -> {
                    YearMonth month = entry.getKey();
                    Map<CategoryType, BigDecimal> amounts = entry.getValue();

                    BigDecimal income = amounts.getOrDefault(CategoryType.INCOME, BigDecimal.ZERO);
                    BigDecimal expense = amounts.getOrDefault(CategoryType.EXPENSE, BigDecimal.ZERO);

                    return MonthlyIncomeExpenseDto.builder()
                            .month(month.toString())
                            .income(income)
                            .expense(expense)
                            .netProfit(income.subtract(expense))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseDistributionDto> getExpenseDistribution(Long companyId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = incomeExpenseRepository.getExpenseDistribution(companyId, startDate, endDate);

        BigDecimal totalExpenses = results.stream()
                .map(row -> (BigDecimal) row[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream()
                .map(row -> {
                    Long categoryId = (Long) row[0];
                    String categoryName = (String) row[1];
                    BigDecimal amount = (BigDecimal) row[2];

                    Double percentage = 0.0;
                    if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = amount.divide(totalExpenses, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
                    }

                    return ExpenseDistributionDto.builder()
                            .categoryId(categoryId)
                            .categoryName(categoryName)
                            .totalAmount(amount)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UnpaidInvoiceSummaryDto> getUnpaidInvoices(Long companyId) {
        List<Invoice> unpaidInvoices = invoiceRepository.findByCompanyIdAndStatus(companyId, InvoiceStatus.UNPAID);
        LocalDate today = LocalDate.now();

        return unpaidInvoices.stream()
                .map(invoice -> {
                    BigDecimal totalPaid = paymentRepository.getTotalPaymentsByInvoiceId(invoice.getId());
                    BigDecimal remainingBalance = invoice.getTotalAmount().subtract(totalPaid);

                    Integer daysOverdue = null;
                    if (invoice.getDueDate() != null && invoice.getDueDate().isBefore(today)) {
                        daysOverdue = (int) ChronoUnit.DAYS.between(invoice.getDueDate(), today);
                    }

                    return UnpaidInvoiceSummaryDto.builder()
                            .invoiceId(invoice.getId())
                            .invoiceNumber(invoice.getInvoiceNumber())
                            .customerSupplierName(invoice.getCustomerSupplier().getName())
                            .invoiceDate(invoice.getInvoiceDate())
                            .dueDate(invoice.getDueDate())
                            .totalAmount(invoice.getTotalAmount())
                            .amountPaid(totalPaid)
                            .remainingBalance(remainingBalance)
                            .daysOverdue(daysOverdue)
                            .build();
                })
                .sorted(Comparator.comparing(UnpaidInvoiceSummaryDto::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}
