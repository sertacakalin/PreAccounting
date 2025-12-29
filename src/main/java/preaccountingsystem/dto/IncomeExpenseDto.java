package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IncomeExpenseDto {
    private Long id;
    private BigDecimal amount;
    private LocalDate date;
    private String description;
    private String receiptFilePath;
    private Long categoryId;
    private String categoryName;
    private String categoryType; // INCOME or EXPENSE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
