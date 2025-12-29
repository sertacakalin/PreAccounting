package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerStatementDto {
    private Long customerId;
    private String customerName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalAmount;
    private Long transactionCount;
    private List<TransactionSummary> transactions;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionSummary {
        private Long id;
        private LocalDate date;
        private String description;
        private BigDecimal amount;
        private String type;
    }
}
