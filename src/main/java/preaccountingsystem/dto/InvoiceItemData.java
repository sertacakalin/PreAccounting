package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a single item in an invoice
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemData {
    private String name;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String description;
}
