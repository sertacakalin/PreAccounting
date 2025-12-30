package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UnpaidInvoiceSummaryDto {
    private Long invoiceId;
    private String invoiceNumber;
    private String customerSupplierName;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingBalance;
    private Integer daysOverdue; // Null if not overdue
}
