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
public class ProductCategoryRequest {

    @NotBlank(message = "Kategori kodu zorunludur")
    private String code;

    @NotBlank(message = "Kategori adı zorunludur")
    private String name;

    private String description;
    private Boolean active;
}
