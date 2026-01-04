package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.CategoryType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private CategoryType type;
    private Long companyId;
    private LocalDateTime createdAt;
}
