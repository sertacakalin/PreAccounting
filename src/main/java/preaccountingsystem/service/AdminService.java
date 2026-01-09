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
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Customer with email " + request.getEmail() + " already exists");
        }

        String generatedPassword = generatePassword();

        User user = User.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .role(Role.CUSTOMER)
                .build();

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


    public CompanyDto createCompany(CreateCompanyRequest request) {
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Company with email " + request.getEmail() + " already exists");
        }

        Customer company = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .taxNo(request.getTaxNo())
                .address(request.getAddress())
                .status(CompanyStatus.ACTIVE)
                .build();

        Customer savedCompany = customerRepository.save(company);

        return convertToCompanyDto(savedCompany);
    }

    public List<CompanyDto> listCompanies() {
        return customerRepository.findAll().stream()
                .map(this::convertToCompanyDto)
                .collect(Collectors.toList());
    }

    public List<CompanyDto> searchCompanies(String query) {
        if (query == null || query.trim().isEmpty()) {
            return listCompanies();
        }

        String searchQuery = query.toLowerCase().trim();
        return customerRepository.findAll().stream()
                .filter(company ->
                    company.getName().toLowerCase().contains(searchQuery) ||
                    (company.getEmail() != null && company.getEmail().toLowerCase().contains(searchQuery)) ||
                    (company.getTaxNo() != null && company.getTaxNo().toLowerCase().contains(searchQuery)))
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
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
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

    public List<UserDto> listAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return listAllUsers();
        }

        String searchQuery = query.toLowerCase().trim();
        return userRepository.findAll().stream()
                .filter(user ->
                    user.getUsername().toLowerCase().contains(searchQuery) ||
                    (user.getCustomer() != null && user.getCustomer().getName().toLowerCase().contains(searchQuery)))
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("Username " + request.getUsername() + " already exists");
        }

        if (request.getRole() == Role.CUSTOMER && request.getCompanyId() == null) {
            throw new BusinessException("CUSTOMER users must be linked to a company. Please select a company.");
        }

        if (request.getRole() == Role.ADMIN && request.getCompanyId() != null) {
            throw new BusinessException("ADMIN users cannot be linked to a company");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        if (request.getRole() == Role.CUSTOMER) {
            Customer company = customerRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

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

        if (user.getRole() != Role.CUSTOMER) {
            throw new BusinessException("Only CUSTOMER users can be linked to a company");
        }

        if (user.getCustomer() != null) {
            Customer oldCompany = user.getCustomer();
            oldCompany.setUser(null);
            user.setCustomer(null);
            customerRepository.save(oldCompany);
        }

        if (request.getCompanyId() != null) {
            Customer newCompany = customerRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

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

        if (userId.equals(currentAdminId)) {
            throw new BusinessException("You cannot delete your own account");
        }

        if (user.getCustomer() != null) {
            Customer company = user.getCustomer();
            company.setUser(null);
            customerRepository.save(company);
        }

        userRepository.delete(user);
    }

    public UserDto updateUserRole(Long userId, UpdateUserRoleRequest request, Long currentAdminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (userId.equals(currentAdminId) && user.getRole() == Role.ADMIN && request.getRole() == Role.CUSTOMER) {
            throw new BusinessException("You cannot demote yourself from ADMIN to CUSTOMER");
        }

        if (user.getRole() == request.getRole()) {
            return convertToUserDto(user);
        }

        if (user.getRole() == Role.CUSTOMER && request.getRole() == Role.ADMIN) {
            if (user.getCustomer() != null) {
                Customer company = user.getCustomer();
                company.setUser(null);
                user.setCustomer(null);
                customerRepository.save(company);
            }
        }

        if (user.getRole() == Role.ADMIN && request.getRole() == Role.CUSTOMER) {
            // When demoting ADMIN to CUSTOMER, they must be assigned to a company
            // This should be done via updateUserCompany endpoint after role change
            // or reject the operation if no company is specified
            throw new BusinessException("ADMIN users cannot be directly demoted to CUSTOMER without company assignment. " +
                    "Please create a new CUSTOMER user with company assignment instead.");
        }

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
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}