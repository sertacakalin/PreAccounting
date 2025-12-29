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
public class CustomerSupplierDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String taxNo;
    private String address;
    private Boolean isCustomer;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
