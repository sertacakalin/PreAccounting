package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import preaccountingsystem.dto.CreateIncomeExpenseRequest;
import preaccountingsystem.dto.IncomeExpenseDto;
import preaccountingsystem.dto.UpdateIncomeExpenseRequest;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.IncomeExpenseService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/income-expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class IncomeExpenseController {

    private final IncomeExpenseService incomeExpenseService;

    @PostMapping
    public ResponseEntity<IncomeExpenseDto> create(
            @Valid @RequestBody CreateIncomeExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        IncomeExpenseDto created = incomeExpenseService.create(
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/receipt")
    public ResponseEntity<IncomeExpenseDto> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        IncomeExpenseDto updated = incomeExpenseService.uploadReceipt(
                id,
                file,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<IncomeExpenseDto>> listAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<IncomeExpenseDto> result = incomeExpenseService.listAll(
                currentUser.getCustomer().getId(),
                categoryId,
                startDate,
                endDate
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeExpenseDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        IncomeExpenseDto result = incomeExpenseService.getById(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeExpenseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateIncomeExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        IncomeExpenseDto updated = incomeExpenseService.update(
                id,
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        incomeExpenseService.delete(id, currentUser.getCustomer().getId());
        return ResponseEntity.noContent().build();
    }
}
