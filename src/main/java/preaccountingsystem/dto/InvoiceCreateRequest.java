package preaccountingsystem.dto;

import preaccountingsystem.entity.InvoiceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class InvoiceCreateRequest {
    
    @NotNull(message = "Invoice type cannot be null")
    private InvoiceType type;
    
    @NotNull(message = "Date cannot be null")
    private LocalDate date;
    
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    private String description;
}
