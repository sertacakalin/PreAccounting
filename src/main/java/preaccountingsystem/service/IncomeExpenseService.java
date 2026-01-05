package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import preaccountingsystem.dto.CreateIncomeExpenseRequest;
import preaccountingsystem.dto.IncomeExpenseDto;
import preaccountingsystem.dto.UpdateIncomeExpenseRequest;
import preaccountingsystem.entity.Category;
import preaccountingsystem.entity.Customer;
import preaccountingsystem.entity.IncomeExpense;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.CategoryRepository;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.IncomeExpenseRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncomeExpenseService {

    private final IncomeExpenseRepository incomeExpenseRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;

    @Value("${file.upload.dir:uploads/receipts}")
    private String uploadDir;

    @Transactional
    public IncomeExpenseDto create(CreateIncomeExpenseRequest request, Long companyId) {
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        IncomeExpense incomeExpense = IncomeExpense.builder()
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "USD")
                .date(request.getDate())
                .description(request.getDescription())
                .category(category)
                .company(company)
                .build();

        IncomeExpense saved = incomeExpenseRepository.save(incomeExpense);
        return convertToDto(saved);
    }

    @Transactional
    public IncomeExpenseDto uploadReceipt(Long id, MultipartFile file, Long companyId) {
        IncomeExpense incomeExpense = incomeExpenseRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Income/Expense not found or access denied"));

        if (file.isEmpty()) {
            throw new BusinessException("File is empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException("File size cannot exceed 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new BusinessException("Only image and PDF files are allowed");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if (incomeExpense.getReceiptFilePath() != null) {
                try {
                    Path oldFilePath = Paths.get(incomeExpense.getReceiptFilePath());
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    log.error("Failed to delete old receipt file: {}", e.getMessage());
                }
            }

            incomeExpense.setReceiptFilePath(filePath.toString());
            IncomeExpense updated = incomeExpenseRepository.save(incomeExpense);

            return convertToDto(updated);
        } catch (IOException e) {
            throw new BusinessException("Failed to upload file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<IncomeExpenseDto> listAll(Long companyId, Long categoryId, LocalDate startDate, LocalDate endDate) {
        List<IncomeExpense> records;

        if (categoryId != null && startDate != null && endDate != null) {
            records = incomeExpenseRepository.findByCompanyIdAndCategoryIdAndDateBetween(
                    companyId, categoryId, startDate, endDate);
        } else if (categoryId != null) {
            records = incomeExpenseRepository.findByCompanyIdAndCategoryId(companyId, categoryId);
        } else if (startDate != null && endDate != null) {
            records = incomeExpenseRepository.findByCompanyIdAndDateBetween(companyId, startDate, endDate);
        } else {
            records = incomeExpenseRepository.findByCompanyId(companyId);
        }

        return records.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncomeExpenseDto getById(Long id, Long companyId) {
        IncomeExpense incomeExpense = incomeExpenseRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Income/Expense not found or access denied"));
        return convertToDto(incomeExpense);
    }

    @Transactional
    public IncomeExpenseDto update(Long id, UpdateIncomeExpenseRequest request, Long companyId) {
        IncomeExpense incomeExpense = incomeExpenseRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Income/Expense not found or access denied"));

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        incomeExpense.setAmount(request.getAmount());
        incomeExpense.setDate(request.getDate());
        incomeExpense.setDescription(request.getDescription());
        incomeExpense.setCategory(category);

        IncomeExpense updated = incomeExpenseRepository.save(incomeExpense);
        return convertToDto(updated);
    }

    @Transactional
    public void delete(Long id, Long companyId) {
        IncomeExpense incomeExpense = incomeExpenseRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Income/Expense not found or access denied"));

        if (incomeExpense.getReceiptFilePath() != null) {
            try {
                Path filePath = Paths.get(incomeExpense.getReceiptFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.error("Failed to delete receipt file: {}", e.getMessage());
            }
        }

        incomeExpenseRepository.delete(incomeExpense);
    }

    private IncomeExpenseDto convertToDto(IncomeExpense entity) {
        return IncomeExpenseDto.builder()
                .id(entity.getId())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .date(entity.getDate())
                .description(entity.getDescription())
                .receiptFilePath(entity.getReceiptFilePath())
                .categoryId(entity.getCategory().getId())
                .categoryName(entity.getCategory().getName())
                .categoryType(entity.getCategory().getType().name())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
