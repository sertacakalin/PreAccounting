package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AIQueryRequest {

    @NotBlank(message = "Query is required")
    @Size(max = 2000, message = "Query cannot exceed 2000 characters")
    private String query;
}
