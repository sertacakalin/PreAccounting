package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.ProductType;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Ürün/Hizmet kodu zorunludur")
    private String code;

    @NotBlank(message = "Ürün/Hizmet adı zorunludur")
    private String name;

    @NotNull(message = "Ürün/Hizmet tipi zorunludur")
    private ProductType type;

    private Long categoryId;
    private Long unitId;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Long taxRateId;
    private BigDecimal stockQuantity;
    private BigDecimal minStockLevel;
    private Boolean active;
    private String description;
}
