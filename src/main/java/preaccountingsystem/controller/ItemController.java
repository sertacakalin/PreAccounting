package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CreateItemRequest;
import preaccountingsystem.dto.ItemDto;
import preaccountingsystem.dto.UpdateItemRequest;
import preaccountingsystem.entity.ItemStatus;
import preaccountingsystem.entity.ItemType;
import preaccountingsystem.entity.Role;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.ItemService;

import java.util.List;

/**
 * REST Controller for Item (Inventory) management.
 * Provides CRUD operations with company-based security.
 *
 * All endpoints require authentication.
 * CUSTOMER users can only access items from their own company.
 * ADMIN users cannot access company items (they don't have a company).
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * Get all items with pagination, filtering, and sorting
     *
     * Query parameters:
     * - search: Search in name and description
     * - type: Filter by PRODUCT or SERVICE
     * - status: Filter by ACTIVE or PASSIVE
     * - category: Filter by category
     * - page: Page number (default: 0)
     * - size: Page size (default: 10)
     * - sortBy: Sort field (default: name)
     * - sortDirection: asc or desc (default: asc)
     */
    @GetMapping
    public ResponseEntity<Page<ItemDto>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);

        Page<ItemDto> items = itemService.getItems(
                companyId, search, type, status, category,
                page, size, sortBy, sortDirection
        );

        return ResponseEntity.ok(items);
    }

    /**
     * Get all active items (for dropdown selections)
     * Note: This endpoint must be defined before /{id} to avoid path matching conflicts
     */
    @GetMapping("/active")
    public ResponseEntity<List<ItemDto>> getActiveItems(
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        List<ItemDto> items = itemService.getActiveItems(companyId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get all unique categories
     * Note: This endpoint must be defined before /{id} to avoid path matching conflicts
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        List<String> categories = itemService.getCategories(companyId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get item by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> getItemById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        ItemDto item = itemService.getItemById(id, companyId);
        return ResponseEntity.ok(item);
    }

    /**
     * Create a new item
     */
    @PostMapping
    public ResponseEntity<ItemDto> createItem(
            @Valid @RequestBody CreateItemRequest request,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        ItemDto createdItem = itemService.createItem(request, companyId);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    /**
     * Update an existing item
     */
    @PutMapping("/{id}")
    public ResponseEntity<ItemDto> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemRequest request,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        ItemDto updatedItem = itemService.updateItem(id, request, companyId);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Delete an item
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        itemService.deleteItem(id, companyId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deactivate an item (set to PASSIVE)
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ItemDto> deactivateItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        ItemDto item = itemService.deactivateItem(id, companyId);
        return ResponseEntity.ok(item);
    }

    /**
     * Activate an item (set to ACTIVE)
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ItemDto> activateItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long companyId = getCompanyIdFromUser(currentUser);
        ItemDto item = itemService.activateItem(id, companyId);
        return ResponseEntity.ok(item);
    }

    /**
     * Extract company ID from authenticated user
     * Only CUSTOMER users have a company
     */
    private Long getCompanyIdFromUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessException("Admin users cannot manage items. Items are company-specific.");
        }

        if (user.getCustomer() == null) {
            throw new BusinessException("User is not linked to any company");
        }

        return user.getCustomer().getId();
    }
}
