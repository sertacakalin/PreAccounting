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
public class CurrencyResponse {

    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Boolean active;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
