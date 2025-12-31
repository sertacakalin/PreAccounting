package preaccountingsystem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CategoryDto;
import preaccountingsystem.entity.CategoryType;
import preaccountingsystem.service.CategoryService;

import java.util.List;

/**
 * Customer-accessible category endpoints (read-only).
 * Allows customers to fetch categories for income/expense forms.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class CustomerCategoryController {

    private final CategoryService categoryService;

    @GetMapping("/income")
    public ResponseEntity<List<CategoryDto>> listIncomeCategories() {
        return ResponseEntity.ok(categoryService.listCategoriesByType(CategoryType.INCOME));
    }

    @GetMapping("/expense")
    public ResponseEntity<List<CategoryDto>> listExpenseCategories() {
        return ResponseEntity.ok(categoryService.listCategoriesByType(CategoryType.EXPENSE));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> listAllCategories() {
        return ResponseEntity.ok(categoryService.listAllCategories());
    }
}
