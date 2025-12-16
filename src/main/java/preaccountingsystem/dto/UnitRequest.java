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
public class UnitRequest {

    @NotBlank(message = "Birim kodu zorunludur")
    private String code;

    @NotBlank(message = "Birim adı zorunludur")
    private String name;

    private String description;
    private Boolean active;
}
