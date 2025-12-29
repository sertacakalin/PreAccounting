package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.SystemSettingsDto;
import preaccountingsystem.dto.UpdateSystemSettingsRequest;
import preaccountingsystem.service.SystemSettingsService;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<SystemSettingsDto> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSettingsDto> updateSettings(@Valid @RequestBody UpdateSystemSettingsRequest request) {
        return ResponseEntity.ok(systemSettingsService.updateSettings(request));
    }
}
