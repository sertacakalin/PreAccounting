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
public class PaymentDto {
    private Long id;
    private String type;
    private BigDecimal amount;
    private String currency;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String notes;
    private Long customerSupplierId;
    private String customerSupplierName;
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
