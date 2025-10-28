package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCustomerResponse {
    private Long customerId;
    private Long userId;
    private String username;
    private String password;
    private String name;
    private String email;
}
