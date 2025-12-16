package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurrencyRequest {

    @NotBlank(message = "Para birimi kodu zorunludur")
    private String code;

    @NotBlank(message = "Para birimi adı zorunludur")
    private String name;

    private String symbol;
    private Boolean active;
    private Boolean isDefault;
}
