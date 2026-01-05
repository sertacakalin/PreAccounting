package preaccountingsystem.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.ItemStatus;
import preaccountingsystem.entity.ItemType;

import java.math.BigDecimal;

/**
 * DTO for updating an existing item.
 * Note: companyId cannot be changed during update (enforced in service layer)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(min = 2, max = 200, message = "Item name must be between 2 and 200 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Item type is required")
    private ItemType type;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    /**
     * Stock quantity - only for PRODUCT type
     * Will be set to NULL automatically if type is SERVICE
     */
    @DecimalMin(value = "0.0", message = "Stock cannot be negative")
    private BigDecimal stock;

    @NotNull(message = "Sale price is required")
    @DecimalMin(value = "0.0", message = "Sale price cannot be negative")
    private BigDecimal salePrice;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", message = "Purchase price cannot be negative")
    private BigDecimal purchasePrice;

    @NotNull(message = "Status is required")
    private ItemStatus status;
}
