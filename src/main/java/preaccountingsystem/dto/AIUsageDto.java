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
public class AIUsageDto {
    private Long id;
    private String query;
    private String response;
    private String username;
    private String companyName;
    private LocalDateTime timestamp;
    private Integer tokensUsed;
}
