package preaccountingsystem.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSystemSettingsRequest {

    @NotBlank(message = "Default currency is required")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters (e.g., USD, EUR, TRY)")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be 3 uppercase letters")
    private String defaultCurrency;

    @NotNull(message = "VAT rates are required")
    @Size(min = 1, message = "At least one VAT rate is required")
    private List<@Min(value = 0, message = "VAT rate must be between 0 and 100")
                 @Max(value = 100, message = "VAT rate must be between 0 and 100") Integer> vatRates;

    @NotBlank(message = "Invoice number format is required")
    @Size(max = 50, message = "Invoice number format cannot exceed 50 characters")
    private String invoiceNumberFormat;

    @NotNull(message = "AI daily limit is required")
    @Min(value = 0, message = "AI daily limit must be at least 0")
    @Max(value = 10000, message = "AI daily limit cannot exceed 10000")
    private Integer aiDailyLimit;

    @NotNull(message = "AI monthly limit is required")
    @Min(value = 0, message = "AI monthly limit must be at least 0")
    @Max(value = 100000, message = "AI monthly limit cannot exceed 100000")
    private Integer aiMonthlyLimit;
}
