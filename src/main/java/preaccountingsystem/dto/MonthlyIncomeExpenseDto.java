package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyIncomeExpenseDto {
    private String month; // Format: YYYY-MM
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal netProfit; // income - expense
}
