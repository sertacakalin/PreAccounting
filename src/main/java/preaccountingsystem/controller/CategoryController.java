package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CategoryDto;
import preaccountingsystem.dto.CreateCategoryRequest;
import preaccountingsystem.entity.CategoryType;
import preaccountingsystem.entity.Role;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/income")
    public ResponseEntity<List<CategoryDto>> getIncomeCategories(@AuthenticationPrincipal User currentUser) {
        Long companyId = getCompanyIdFromUser(currentUser);
        List<CategoryDto> categories = categoryService.getCategoriesByType(companyId, CategoryType.INCOME);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/expense")
    public ResponseEntity<List<CategoryDto>> getExpenseCategories(@AuthenticationPrincipal User currentUser) {
        Long companyId = getCompanyIdFromUser(currentUser);
        List<CategoryDto> categories = categoryService.getCategoriesByType(companyId, CategoryType.EXPENSE);
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories(@AuthenticationPrincipal User currentUser) {
        Long companyId = getCompanyIdFromUser(currentUser);
        List<CategoryDto> categories = categoryService.getAllCategories(companyId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @Valid @RequestBody CreateCategoryRequest request,
            @AuthenticationPrincipal User currentUser) {
        Long companyId = getCompanyIdFromUser(currentUser);
        CategoryDto category = categoryService.createCategory(request, companyId);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    private Long getCompanyIdFromUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessException("Admin users cannot manage categories. Categories are company-specific.");
        }

        if (user.getCustomer() == null) {
            throw new BusinessException("User is not linked to any company");
        }

        return user.getCustomer().getId();
    }
}
