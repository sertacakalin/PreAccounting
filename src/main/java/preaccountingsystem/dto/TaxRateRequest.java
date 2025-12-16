package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaxRateRequest {

    @NotBlank(message = "KDV kodu zorunludur")
    private String code;

    @NotBlank(message = "KDV adı zorunludur")
    private String name;

    @NotNull(message = "KDV oranı zorunludur")
    private BigDecimal rate;

    private String description;
    private Boolean active;
}
