package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.CreateItemRequest;
import preaccountingsystem.dto.ItemDto;
import preaccountingsystem.dto.UpdateItemRequest;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.ItemRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Item management.
 * Handles business logic, validation, and company-based security.
 */
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;

    /**
     * Get all items for a company with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<ItemDto> getItems(Long companyId,
                                   String search,
                                   ItemType type,
                                   ItemStatus status,
                                   String category,
                                   int page,
                                   int size,
                                   String sortBy,
                                   String sortDirection) {

        if (!customerRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Item> itemPage = itemRepository.findByFilters(
                companyId,
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                type,
                status,
                category != null && !category.trim().isEmpty() ? category.trim() : null,
                pageable
        );

        return itemPage.map(this::convertToDto);
    }

    /**
     * Get item by ID (with company security check)
     */
    @Transactional(readOnly = true)
    public ItemDto getItemById(Long id, Long companyId) {
        Item item = itemRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id + " for your company"));

        return convertToDto(item);
    }

    /**
     * Get all active items for a company (for dropdowns)
     */
    @Transactional(readOnly = true)
    public List<ItemDto> getActiveItems(Long companyId) {
        if (!customerRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        return itemRepository.findByCompanyIdAndStatus(companyId, ItemStatus.ACTIVE).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all unique categories for a company
     */
    @Transactional(readOnly = true)
    public List<String> getCategories(Long companyId) {
        if (!customerRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        return itemRepository.findDistinctCategoriesByCompanyId(companyId);
    }

    /**
     * Create a new item
     */
    @Transactional
    public ItemDto createItem(CreateItemRequest request, Long companyId) {
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        if (request.getType() == ItemType.SERVICE && request.getStock() != null) {
            throw new BusinessException("SERVICE type items cannot have stock. Stock must be null for services.");
        }

        if (request.getType() == ItemType.PRODUCT && request.getStock() == null) {
            request.setStock(java.math.BigDecimal.ZERO);
        }

        Item item = Item.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .type(request.getType())
                .category(request.getCategory().trim())
                .stock(request.getType() == ItemType.SERVICE ? null : request.getStock())
                .salePrice(request.getSalePrice())
                .purchasePrice(request.getPurchasePrice())
                .status(request.getStatus() != null ? request.getStatus() : ItemStatus.ACTIVE)
                .company(company)
                .build();

        Item savedItem = itemRepository.save(item);
        return convertToDto(savedItem);
    }

    /**
     * Update an existing item
     */
    @Transactional
    public ItemDto updateItem(Long id, UpdateItemRequest request, Long companyId) {
        Item item = itemRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id + " for your company"));

        if (request.getType() == ItemType.SERVICE && request.getStock() != null) {
            throw new BusinessException("SERVICE type items cannot have stock. Stock must be null for services.");
        }

        if (item.getType() == ItemType.PRODUCT && request.getType() == ItemType.SERVICE) {
            request.setStock(null);
        }

        if (item.getType() == ItemType.SERVICE && request.getType() == ItemType.PRODUCT) {
            if (request.getStock() == null) {
                request.setStock(java.math.BigDecimal.ZERO);
            }
        }

        item.setName(request.getName().trim());
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        item.setType(request.getType());
        item.setCategory(request.getCategory().trim());
        item.setStock(request.getType() == ItemType.SERVICE ? null : request.getStock());
        item.setSalePrice(request.getSalePrice());
        item.setPurchasePrice(request.getPurchasePrice());
        item.setStatus(request.getStatus());

        Item updatedItem = itemRepository.save(item);
        return convertToDto(updatedItem);
    }

    /**
     * Delete an item
     */
    @Transactional
    public void deleteItem(Long id, Long companyId) {
        Item item = itemRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id + " for your company"));

        itemRepository.delete(item);
    }

    /**
     * Deactivate an item (set to PASSIVE)
     */
    @Transactional
    public ItemDto deactivateItem(Long id, Long companyId) {
        Item item = itemRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id + " for your company"));

        item.setStatus(ItemStatus.PASSIVE);
        Item updatedItem = itemRepository.save(item);
        return convertToDto(updatedItem);
    }

    /**
     * Activate an item (set to ACTIVE)
     */
    @Transactional
    public ItemDto activateItem(Long id, Long companyId) {
        Item item = itemRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id + " for your company"));

        item.setStatus(ItemStatus.ACTIVE);
        Item updatedItem = itemRepository.save(item);
        return convertToDto(updatedItem);
    }

    /**
     * Convert Item entity to ItemDto
     */
    private ItemDto convertToDto(Item item) {
        return ItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .type(item.getType())
                .category(item.getCategory())
                .stock(item.getStock())
                .salePrice(item.getSalePrice())
                .purchasePrice(item.getPurchasePrice())
                .status(item.getStatus())
                .companyId(item.getCompany().getId())
                .companyName(item.getCompany().getName())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
