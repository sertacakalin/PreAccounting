package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.AccountType;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRequest {

    @NotBlank(message = "Cari kodu zorunludur")
    private String code;

    @NotBlank(message = "Cari adı zorunludur")
    private String name;

    @NotNull(message = "Cari tipi zorunludur")
    private AccountType type;

    private String taxNo;
    private String taxOffice;
    private String email;
    private String phone;
    private String mobile;
    private String address;
    private String city;
    private String country;
    private BigDecimal creditLimit;
    private Boolean active;
    private String notes;
}
