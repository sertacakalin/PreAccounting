package preaccountingsystem.service;

import preaccountingsystem.config.JwtService;
import preaccountingsystem.dto.AuthRequest;
import preaccountingsystem.dto.AuthResponse;
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

        // User entity zaten UserDetails'i implement ediyor
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
}