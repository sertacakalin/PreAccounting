package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Bu satırı silebilirsin istersen
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.AIQueryRequest;
import preaccountingsystem.dto.AIQueryResponse;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.AIService;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
// DEĞİŞİKLİK: @PreAuthorize("hasAuthority('CUSTOMER')") kaldırdım.
// SecurityConfig zaten authenticated() kontrolü yapıyor.
public class AIAssistantController {

    private final AIService aiService;

    @PostMapping("/query")
    public ResponseEntity<AIQueryResponse> query(
            @Valid @RequestBody AIQueryRequest request,
            @AuthenticationPrincipal User currentUser) {

        // Güvenlik kontrolü: Kullanıcının şirketi var mı?
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("Bu işlemi yapmak için bir şirkete bağlı olmalısınız.");
        }

        AIQueryResponse response = aiService.processQuery(
                request,
                currentUser.getCustomer().getId(),
                currentUser
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/usage-stats")
    public ResponseEntity<Map<String, Long>> getUsageStats(
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("Kullanıcı bir şirkete bağlı değil.");
        }

        Map<String, Long> stats = aiService.getUsageStats(
                currentUser.getCustomer().getId()
        );

        return ResponseEntity.ok(stats);
    }
}