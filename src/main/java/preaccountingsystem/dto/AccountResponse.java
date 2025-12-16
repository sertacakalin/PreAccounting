package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountResponse {

    private Long id;
    private String code;
    private String name;
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
    private BigDecimal balance;
    private Boolean active;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
