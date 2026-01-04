package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.CategoryDto;
import preaccountingsystem.dto.CreateCategoryRequest;
import preaccountingsystem.entity.Category;
import preaccountingsystem.entity.CategoryType;
import preaccountingsystem.entity.Customer;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.CategoryRepository;
import preaccountingsystem.repository.CustomerRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesByType(Long companyId, CategoryType type) {
        if (!customerRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        return categoryRepository.findByCompanyIdAndType(companyId, type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories(Long companyId) {
        if (!customerRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        return categoryRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request, Long companyId) {
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        Category category = Category.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .company(company)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    private CategoryDto convertToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .companyId(category.getCompany().getId())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
