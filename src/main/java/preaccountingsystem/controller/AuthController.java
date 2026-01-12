package preaccountingsystem.controller;

import preaccountingsystem.dto.AuthRequest;
import preaccountingsystem.dto.AuthResponse;
import preaccountingsystem.dto.UserDto;
import preaccountingsystem.entity.User;
import preaccountingsystem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(authService.getCurrentUser(currentUser));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless, so logout is handled client-side by removing the token
        return ResponseEntity.ok().build();
    }
}
