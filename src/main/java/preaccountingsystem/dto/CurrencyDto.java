package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyDto {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Boolean isActive;
}
