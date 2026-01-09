package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.User;
import preaccountingsystem.service.AdminService;

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

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listAllUsers(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(adminService.searchUsers(search));
        }
        return ResponseEntity.ok(adminService.listAllUsers());
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDto> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return new ResponseEntity<>(adminService.createCompany(request), HttpStatus.CREATED);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDto>> listCompanies(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(adminService.searchCompanies(search));
        }
        return ResponseEntity.ok(adminService.listCompanies());
    }

    @PatchMapping("/companies/{id}/status")
    public ResponseEntity<CompanyDto> updateCompanyStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyStatusRequest request) {
        return ResponseEntity.ok(adminService.updateCompanyStatus(id, request));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CompanyDto> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(adminService.updateCompany(id, request));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return new ResponseEntity<>(adminService.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
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