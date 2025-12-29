package preaccountingsystem.controller;

import preaccountingsystem.dto.*;
import preaccountingsystem.entity.User;
import preaccountingsystem.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/reset-admin-password")
    public ResponseEntity<String> resetAdminPassword() {
        adminService.resetAdminPassword();
        return ResponseEntity.ok("Admin password reset to: admin123");
    }

    @PostMapping("/customers")
    public ResponseEntity<CreateCustomerResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return new ResponseEntity<>(adminService.createCustomer(request), HttpStatus.CREATED);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDto>> listCustomers() {
        return ResponseEntity.ok(adminService.listCustomers());
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDto>> listInvoicesByCustomerId(@RequestParam Long customerId) {
        return ResponseEntity.ok(adminService.listInvoicesByCustomerId(customerId));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<SummaryReportResponse> getSummaryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adminService.summaryReport(from, to));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listAllUsers() {
        return ResponseEntity.ok(adminService.listAllUsers());
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDto> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return new ResponseEntity<>(adminService.createCompany(request), HttpStatus.CREATED);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDto>> listCompanies() {
        return ResponseEntity.ok(adminService.listCompanies());
    }

    @PatchMapping("/companies/{id}/status")
    public ResponseEntity<CompanyDto> updateCompanyStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyStatusRequest request) {
        return ResponseEntity.ok(adminService.updateCompanyStatus(id, request));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return new ResponseEntity<>(adminService.createUser(request), HttpStatus.CREATED);
    }

    @PatchMapping("/users/{id}/company")
    public ResponseEntity<UserDto> updateUserCompany(
            @PathVariable Long id,
            @RequestBody UpdateUserCompanyRequest request) {
        return ResponseEntity.ok(adminService.updateUserCompany(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        adminService.deleteUser(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request, currentUser.getId()));
    }
}