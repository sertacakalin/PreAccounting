package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CategoryDto;
import preaccountingsystem.dto.CreateCategoryRequest;
import preaccountingsystem.dto.UpdateCategoryRequest;
import preaccountingsystem.entity.CategoryType;
import preaccountingsystem.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // Income Category Endpoints
    @PostMapping("/income")
    public ResponseEntity<CategoryDto> createIncomeCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return new ResponseEntity<>(categoryService.createCategory(request, CategoryType.INCOME), HttpStatus.CREATED);
    }

    @GetMapping("/income")
    public ResponseEntity<List<CategoryDto>> listIncomeCategories() {
        return ResponseEntity.ok(categoryService.listCategoriesByType(CategoryType.INCOME));
    }

    @GetMapping("/income/{id}")
    public ResponseEntity<CategoryDto> getIncomeCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PutMapping("/income/{id}")
    public ResponseEntity<CategoryDto> updateIncomeCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/income/{id}")
    public ResponseEntity<Void> deleteIncomeCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Expense Category Endpoints
    @PostMapping("/expense")
    public ResponseEntity<CategoryDto> createExpenseCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return new ResponseEntity<>(categoryService.createCategory(request, CategoryType.EXPENSE), HttpStatus.CREATED);
    }

    @GetMapping("/expense")
    public ResponseEntity<List<CategoryDto>> listExpenseCategories() {
        return ResponseEntity.ok(categoryService.listCategoriesByType(CategoryType.EXPENSE));
    }

    @GetMapping("/expense/{id}")
    public ResponseEntity<CategoryDto> getExpenseCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PutMapping("/expense/{id}")
    public ResponseEntity<CategoryDto> updateExpenseCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/expense/{id}")
    public ResponseEntity<Void> deleteExpenseCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
