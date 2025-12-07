package preaccountingsystem.controller;

import preaccountingsystem.dto.*;
import preaccountingsystem.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<InvoiceDto>> listInvoices(@RequestParam(required = false) Long customerId) {
        if (customerId != null) {
            return ResponseEntity.ok(adminService.listInvoicesByCustomerId(customerId));
        }
        return ResponseEntity.ok(adminService.listAllInvoices());
    }

    @DeleteMapping("/customers/{customerId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long customerId) {
        adminService.deleteCustomer(customerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<SummaryReportResponse> getSummaryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adminService.summaryReport(from, to));
    }
}