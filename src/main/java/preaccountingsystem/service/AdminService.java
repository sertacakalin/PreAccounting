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

    public List<InvoiceDto> listInvoicesByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(this::convertToInvoiceDto)
                .collect(Collectors.toList());
    }

    public SummaryReportResponse summaryReport(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new BusinessException("'From' date cannot be after 'to' date");
        }

        BigDecimal totalIncome = invoiceRepository.getSumOfAmountByTypeAndDateBetween(InvoiceType.INCOME, from, to);
        BigDecimal totalExpense = invoiceRepository.getSumOfAmountByTypeAndDateBetween(InvoiceType.EXPENSE, from, to);
        
        totalIncome = totalIncome == null ? BigDecimal.ZERO : totalIncome;
        totalExpense = totalExpense == null ? BigDecimal.ZERO : totalExpense;
        
        BigDecimal netProfit = totalIncome.subtract(totalExpense);
        long invoiceCount = invoiceRepository.countInvoicesByDateBetween(from, to);

        return SummaryReportResponse.builder()
                .fromDate(from)
                .toDate(to)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netProfit(netProfit)
                .invoiceCount(invoiceCount)
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

    private InvoiceDto convertToInvoiceDto(Invoice invoice) {
        return InvoiceDto.builder()
                .id(invoice.getId())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomer().getName())
                .type(invoice.getType())
                .date(invoice.getDate())
                .amount(invoice.getAmount())
                .description(invoice.getDescription())
                .createdAt(invoice.getCreatedAt())
                .build();
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
