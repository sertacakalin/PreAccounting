package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.AITemplateDto;
import preaccountingsystem.dto.CreateAITemplateRequest;
import preaccountingsystem.dto.UpdateAITemplateRequest;
import preaccountingsystem.service.AITemplateService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ai-templates")
@RequiredArgsConstructor
public class AITemplateController {

    private final AITemplateService aiTemplateService;

    @PostMapping
    public ResponseEntity<AITemplateDto> createTemplate(@Valid @RequestBody CreateAITemplateRequest request) {
        return new ResponseEntity<>(aiTemplateService.createTemplate(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AITemplateDto>> listTemplates() {
        return ResponseEntity.ok(aiTemplateService.listAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AITemplateDto> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(aiTemplateService.getTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AITemplateDto> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAITemplateRequest request) {
        return ResponseEntity.ok(aiTemplateService.updateTemplate(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        aiTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
