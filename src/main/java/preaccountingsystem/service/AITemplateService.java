package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.AITemplateDto;
import preaccountingsystem.dto.CreateAITemplateRequest;
import preaccountingsystem.dto.UpdateAITemplateRequest;
import preaccountingsystem.entity.AITemplate;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.AITemplateRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AITemplateService {

    private final AITemplateRepository aiTemplateRepository;

    @Transactional
    public AITemplateDto createTemplate(CreateAITemplateRequest request) {
        AITemplate template = AITemplate.builder()
                .name(request.getName())
                .description(request.getDescription())
                .promptTemplate(request.getPromptTemplate())
                .active(true)
                .build();

        AITemplate savedTemplate = aiTemplateRepository.save(template);
        return convertToDto(savedTemplate);
    }

    @Transactional(readOnly = true)
    public List<AITemplateDto> listAllTemplates() {
        return aiTemplateRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AITemplateDto getTemplateById(Long id) {
        AITemplate template = aiTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI Template not found with id: " + id));
        return convertToDto(template);
    }

    @Transactional
    public AITemplateDto updateTemplate(Long id, UpdateAITemplateRequest request) {
        AITemplate template = aiTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI Template not found with id: " + id));

        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setPromptTemplate(request.getPromptTemplate());
        template.setActive(request.getActive());

        AITemplate updatedTemplate = aiTemplateRepository.save(template);
        return convertToDto(updatedTemplate);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        AITemplate template = aiTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI Template not found with id: " + id));
        aiTemplateRepository.delete(template);
    }

    private AITemplateDto convertToDto(AITemplate template) {
        return AITemplateDto.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .promptTemplate(template.getPromptTemplate())
                .active(template.getActive())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
