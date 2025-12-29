package preaccountingsystem.service;

import preaccountingsystem.dto.*;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.InvoiceRepository;
import preaccountingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    public void resetAdminPassword() {
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        admin.setPassword(passwordEncoder.encode("admin123"));
        userRepository.save(admin);
    }

    public CreateCustomerResponse createCustomer(CreateCustomerRequest request) {
        // Email'in benzersiz olup olmadığını kontrol et
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Customer with email " + request.getEmail() + " already exists");
        }

        // Otomatik şifre oluştur
        String generatedPassword = generatePassword();

        // User oluştur
        User user = User.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .role(Role.CUSTOMER)
                .build();

        // Customer oluştur
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .taxNo(request.getTaxNo())
                .address(request.getAddress())
                .user(user)
                .build();

        user.setCustomer(customer);

        User savedUser = userRepository.save(user);
        Customer savedCustomer = customerRepository.save(customer);

        return CreateCustomerResponse.builder()
                .customerId(savedCustomer.getId())
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .password(generatedPassword)
                .name(savedCustomer.getName())
                .email(savedCustomer.getEmail())
                .build();
    }

    public List<CustomerDto> listCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToCustomerDto)
                .collect(Collectors.toList());
    }

    // Commented out - replaced by IncomeExpenseService
    // public List<InvoiceDto> listInvoicesByCustomerId(Long customerId) {
    //     if (!customerRepository.existsById(customerId)) {
    //         throw new ResourceNotFoundException("Customer not found with id: " + customerId);
    //     }
    //     return invoiceRepository.findByCustomerId(customerId).stream()
    //             .map(this::convertToInvoiceDto)
    //             .collect(Collectors.toList());
    // }

    // Commented out - replaced by IncomeExpenseService
    // public SummaryReportResponse summaryReport(LocalDate from, LocalDate to) {
    //     if (from.isAfter(to)) {
    //         throw new BusinessException("'From' date cannot be after 'to' date");
    //     }
    //
    //     BigDecimal totalIncome = invoiceRepository.getSumOfAmountByTypeAndDateBetween(InvoiceType.INCOME, from, to);
    //     BigDecimal totalExpense = invoiceRepository.getSumOfAmountByTypeAndDateBetween(InvoiceType.EXPENSE, from, to);
    //
    //     totalIncome = totalIncome == null ? BigDecimal.ZERO : totalIncome;
    //     totalExpense = totalExpense == null ? BigDecimal.ZERO : totalExpense;
    //
    //     BigDecimal netProfit = totalIncome.subtract(totalExpense);
    //     long invoiceCount = invoiceRepository.countInvoicesByDateBetween(from, to);
    //
    //     return SummaryReportResponse.builder()
    //             .fromDate(from)
    //             .toDate(to)
    //             .totalIncome(totalIncome)
    //             .totalExpense(totalExpense)
    //             .netProfit(netProfit)
    //             .invoiceCount(invoiceCount)
    //             .build();
    // }

    public CompanyDto createCompany(CreateCompanyRequest request) {
        // Check if email already exists
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Company with email " + request.getEmail() + " already exists");
        }

        // Generate password for company user
        String generatedPassword = generatePassword();

        // Create User for company
        User user = User.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .role(Role.CUSTOMER)
                .build();

        // Create Company (Customer)
        Customer company = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .taxNo(request.getTaxNo())
                .address(request.getAddress())
                .status(CompanyStatus.ACTIVE)
                .user(user)
                .build();

        user.setCustomer(company);

        User savedUser = userRepository.save(user);
        Customer savedCompany = customerRepository.save(company);

        return convertToCompanyDto(savedCompany);
    }

    public List<CompanyDto> listCompanies() {
        return customerRepository.findAll().stream()
                .map(this::convertToCompanyDto)
                .collect(Collectors.toList());
    }

    public CompanyDto updateCompanyStatus(Long companyId, UpdateCompanyStatusRequest request) {
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        company.setStatus(request.getStatus());
        Customer updatedCompany = customerRepository.save(company);

        return convertToCompanyDto(updatedCompany);
    }

    private CompanyDto convertToCompanyDto(Customer customer) {
        return CompanyDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .taxNo(customer.getTaxNo())
                .address(customer.getAddress())
                .status(customer.getStatus())
                .userId(customer.getUser() != null ? customer.getUser().getId() : null)
                .username(customer.getUser() != null ? customer.getUser().getUsername() : null)
                .build();
    }

    private CustomerDto convertToCustomerDto(Customer customer) {
        return CustomerDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .taxNo(customer.getTaxNo())
                .address(customer.getAddress())
                .username(customer.getUser() != null ? customer.getUser().getUsername() : "N/A")
                .build();
    }

    // Commented out - replaced by InvoiceService
    // private InvoiceDto convertToInvoiceDto(Invoice invoice) {
    //     return InvoiceDto.builder()
    //             .id(invoice.getId())
    //             .customerId(invoice.getCustomer().getId())
    //             .customerName(invoice.getCustomer().getName())
    //             .type(invoice.getType())
    //             .date(invoice.getDate())
    //             .amount(invoice.getAmount())
    //             .description(invoice.getDescription())
    //             .createdAt(invoice.getCreatedAt())
    //             .build();
    // }

    public List<UserDto> listAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    public UserDto createUser(CreateUserRequest request) {
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("Username " + request.getUsername() + " already exists");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        // Link to company if provided and role is CUSTOMER
        if (request.getCompanyId() != null) {
            if (request.getRole() != Role.CUSTOMER) {
                throw new BusinessException("Only CUSTOMER users can be linked to a company");
            }
            Customer company = customerRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

            // Check if company already has a user
            if (company.getUser() != null) {
                throw new BusinessException("Company already has an associated user");
            }

            user.setCustomer(company);
            company.setUser(user);
        }

        User savedUser = userRepository.save(user);
        return convertToUserDto(savedUser);
    }

    public UserDto updateUserCompany(Long userId, UpdateUserCompanyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only CUSTOMER users can be linked to companies
        if (user.getRole() != Role.CUSTOMER) {
            throw new BusinessException("Only CUSTOMER users can be linked to a company");
        }

        // Unlink from current company if exists
        if (user.getCustomer() != null) {
            Customer oldCompany = user.getCustomer();
            oldCompany.setUser(null);
            user.setCustomer(null);
            customerRepository.save(oldCompany);
        }

        // Link to new company if provided
        if (request.getCompanyId() != null) {
            Customer newCompany = customerRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

            // Check if company already has a user
            if (newCompany.getUser() != null && !newCompany.getUser().getId().equals(userId)) {
                throw new BusinessException("Company already has an associated user");
            }

            user.setCustomer(newCompany);
            newCompany.setUser(user);
        }

        User updatedUser = userRepository.save(user);
        return convertToUserDto(updatedUser);
    }

    public void deleteUser(Long userId, Long currentAdminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Admin cannot delete their own account
        if (userId.equals(currentAdminId)) {
            throw new BusinessException("You cannot delete your own account");
        }

        // If user has a company, unlink it first
        if (user.getCustomer() != null) {
            Customer company = user.getCustomer();
            company.setUser(null);
            customerRepository.save(company);
        }

        // Hard delete user
        userRepository.delete(user);
    }

    public UserDto updateUserRole(Long userId, UpdateUserRoleRequest request, Long currentAdminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Admin cannot demote themselves
        if (userId.equals(currentAdminId) && user.getRole() == Role.ADMIN && request.getRole() == Role.CUSTOMER) {
            throw new BusinessException("You cannot demote yourself from ADMIN to CUSTOMER");
        }

        // If current role is same as requested role, return as is
        if (user.getRole() == request.getRole()) {
            return convertToUserDto(user);
        }

        // Handle role change from CUSTOMER to ADMIN
        if (user.getRole() == Role.CUSTOMER && request.getRole() == Role.ADMIN) {
            // Unlink from company if linked
            if (user.getCustomer() != null) {
                Customer company = user.getCustomer();
                company.setUser(null);
                user.setCustomer(null);
                customerRepository.save(company);
            }
        }

        // Handle role change from ADMIN to CUSTOMER
        if (user.getRole() == Role.ADMIN && request.getRole() == Role.CUSTOMER) {
            // CUSTOMER role doesn't require a company, but it's recommended
            // User can be linked to a company later using PATCH /api/admin/users/{id}/company
        }

        // Update role
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);

        return convertToUserDto(updatedUser);
    }

    private UserDto convertToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .customerId(user.getCustomer() != null ? user.getCustomer().getId() : null)
                .customerName(user.getCustomer() != null ? user.getCustomer().getName() : null)
                .build();
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}