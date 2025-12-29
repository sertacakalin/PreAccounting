package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemSettingsDto {
    private String defaultCurrency;
    private List<Integer> vatRates;
    private String invoiceNumberFormat;
    private Integer aiDailyLimit;
    private Integer aiMonthlyLimit;
}
