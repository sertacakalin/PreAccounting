package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.CustomerSupplierService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class CustomerSupplierController {

    private final CustomerSupplierService customerSupplierService;

    @PostMapping
    public ResponseEntity<CustomerSupplierDto> createCustomerSupplier(
            @Valid @RequestBody CreateCustomerSupplierRequest request,
            @AuthenticationPrincipal User currentUser) {

        // Ensure user has a company
        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        CustomerSupplierDto created = customerSupplierService.createCustomerSupplier(
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<CustomerSupplierDto>> listCustomerSuppliers(
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        Long companyId = currentUser.getCustomer().getId();
        List<CustomerSupplierDto> result;

        if ("customer".equalsIgnoreCase(type)) {
            result = customerSupplierService.listCustomers(companyId);
        } else if ("supplier".equalsIgnoreCase(type)) {
            result = customerSupplierService.listSuppliers(companyId);
        } else {
            result = customerSupplierService.listAll(companyId);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerSupplierDto> getCustomerSupplier(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        CustomerSupplierDto result = customerSupplierService.getById(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerSupplierDto> updateCustomerSupplier(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerSupplierRequest request,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        CustomerSupplierDto updated = customerSupplierService.update(
                id,
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomerSupplier(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        customerSupplierService.delete(id, currentUser.getCustomer().getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/statement")
    public ResponseEntity<CustomerStatementDto> getCustomerStatement(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        CustomerStatementDto statement = customerSupplierService.getCustomerStatement(
                id,
                from,
                to,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(statement);
    }
}
