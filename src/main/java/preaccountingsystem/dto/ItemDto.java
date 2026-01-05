package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.ItemStatus;
import preaccountingsystem.entity.ItemType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Item responses.
 * Includes all item information for display purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Long id;
    private String name;
    private String description;
    private ItemType type;
    private String category;
    private BigDecimal stock;  // NULL for SERVICE type
    private BigDecimal salePrice;
    private BigDecimal purchasePrice;
    private ItemStatus status;
    private Long companyId;
    private String companyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
