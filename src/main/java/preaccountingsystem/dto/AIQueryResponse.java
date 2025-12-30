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
public class AIQueryResponse {
    private String response;
    private LocalDateTime timestamp;
    private Integer remainingDailyQueries;
    private Integer remainingMonthlyQueries;
    private Boolean limitReached;
}
