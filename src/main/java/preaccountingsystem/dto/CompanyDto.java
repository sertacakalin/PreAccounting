package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.CompanyStatus;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String taxNo;
    private String address;
    private CompanyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
