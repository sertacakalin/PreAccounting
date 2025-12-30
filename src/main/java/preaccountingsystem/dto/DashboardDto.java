package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDto {
    // Summary metrics
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;
    private Integer totalUnpaidInvoices;
    private BigDecimal totalUnpaidAmount;

    // Monthly breakdown
    private List<MonthlyIncomeExpenseDto> monthlyData;

    // Expense distribution by category
    private List<ExpenseDistributionDto> expenseDistribution;

    // Unpaid invoices
    private List<UnpaidInvoiceSummaryDto> unpaidInvoices;
}
