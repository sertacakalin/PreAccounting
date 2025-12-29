package preaccountingsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import preaccountingsystem.entity.CompanyStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCompanyStatusRequest {

    @NotNull(message = "Status is required")
    private CompanyStatus status;
}
