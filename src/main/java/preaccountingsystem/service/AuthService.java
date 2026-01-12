package preaccountingsystem.service;

import preaccountingsystem.config.JwtService;
import preaccountingsystem.dto.AuthRequest;
import preaccountingsystem.dto.AuthResponse;
import preaccountingsystem.dto.UserDto;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.UnauthorizedException;
import preaccountingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Check if user has a customer/company and if it's INACTIVE or SUSPENDED
        if (user.getCustomer() != null && user.getCustomer().getStatus() != preaccountingsystem.entity.CompanyStatus.ACTIVE) {
            throw new UnauthorizedException("Your company account has been deactivated. Please contact the administrator.");
        }

        String jwtToken = jwtService.generateToken(user);

        Long customerId = null;
        if (user.getCustomer() != null) {
            customerId = user.getCustomer().getId();
        }

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .customerId(customerId)
                .build();
    }

    public UserDto getCurrentUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        Long customerId = null;
        String customerName = null;
        if (user.getCustomer() != null) {
            customerId = user.getCustomer().getId();
            customerName = user.getCustomer().getName();
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .customerId(customerId)
                .customerName(customerName)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
