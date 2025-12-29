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
public class CreateAITemplateRequest {

    @NotBlank(message = "Template name is required")
    @Size(min = 2, max = 100, message = "Template name must be between 2 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotBlank(message = "Prompt template is required")
    @Size(min = 10, message = "Prompt template must be at least 10 characters")
    private String promptTemplate;
}
