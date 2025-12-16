package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategoryResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
}
