package preaccountingsystem.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateInvoiceRequest {

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    private String currency; // Optional, defaults to USD if not provided

    @NotNull(message = "Customer/Supplier ID is required")
    private Long customerSupplierId;

    @NotEmpty(message = "At least one invoice item is required")
    @Valid
    private List<CreateInvoiceItemRequest> items;
}
