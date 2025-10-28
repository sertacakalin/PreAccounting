package preaccountingsystem.dto;

import preaccountingsystem.entity.InvoiceType;
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
public class InvoiceDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private InvoiceType type;
    private LocalDate date;
    private BigDecimal amount;
    private String description;
    private LocalDate createdAt;
}
