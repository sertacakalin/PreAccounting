package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.ProductType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private Long id;
    private String code;
    private String name;
    private ProductType type;
    private Long categoryId;
    private String categoryName;
    private Long unitId;
    private String unitName;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Long taxRateId;
    private String taxRateName;
    private BigDecimal taxRateValue;
    private BigDecimal stockQuantity;
    private BigDecimal minStockLevel;
    private Boolean active;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
