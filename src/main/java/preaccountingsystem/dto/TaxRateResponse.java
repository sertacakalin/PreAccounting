package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaxRateResponse {

    private Long id;
    private String code;
    private String name;
    private BigDecimal rate;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
}
