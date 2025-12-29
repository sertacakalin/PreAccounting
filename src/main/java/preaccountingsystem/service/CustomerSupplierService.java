package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.Customer;
import preaccountingsystem.entity.CustomerSupplier;
import preaccountingsystem.entity.Invoice;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.exception.UnauthorizedException;
import preaccountingsystem.repository.CustomerRepository;
import preaccountingsystem.repository.CustomerSupplierRepository;
import preaccountingsystem.repository.InvoiceRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerSupplierService {

    private final CustomerSupplierRepository customerSupplierRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public CustomerSupplierDto createCustomerSupplier(CreateCustomerSupplierRequest request, Long companyId) {
        // Validate company exists
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        CustomerSupplier customerSupplier = CustomerSupplier.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .taxNo(request.getTaxNo())
                .address(request.getAddress())
                .isCustomer(request.getIsCustomer())
                .active(true)
                .company(company)
                .build();

        CustomerSupplier saved = customerSupplierRepository.save(customerSupplier);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerSupplierDto> listAll(Long companyId) {
        return customerSupplierRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomerSupplierDto> listCustomers(Long companyId) {
        return customerSupplierRepository.findByCompanyIdAndIsCustomerTrue(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomerSupplierDto> listSuppliers(Long companyId) {
        return customerSupplierRepository.findByCompanyIdAndIsCustomerFalse(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerSupplierDto getById(Long id, Long companyId) {
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));
        return convertToDto(customerSupplier);
    }

    @Transactional
    public CustomerSupplierDto update(Long id, UpdateCustomerSupplierRequest request, Long companyId) {
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));

        customerSupplier.setName(request.getName());
        customerSupplier.setEmail(request.getEmail());
        customerSupplier.setPhone(request.getPhone());
        customerSupplier.setTaxNo(request.getTaxNo());
        customerSupplier.setAddress(request.getAddress());
        customerSupplier.setIsCustomer(request.getIsCustomer());
        customerSupplier.setActive(request.getActive());

        CustomerSupplier updated = customerSupplierRepository.save(customerSupplier);
        return convertToDto(updated);
    }

    @Transactional
    public void delete(Long id, Long companyId) {
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));

        customerSupplierRepository.delete(customerSupplier);
    }

    @Transactional(readOnly = true)
    public CustomerStatementDto getCustomerStatement(Long customerId, LocalDate from, LocalDate to, Long companyId) {
        // Verify customer belongs to company
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(customerId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found or access denied"));

        // For now, return a placeholder statement
        // This would be connected to invoices/transactions in a real implementation
        return CustomerStatementDto.builder()
                .customerId(customerSupplier.getId())
                .customerName(customerSupplier.getName())
                .fromDate(from)
                .toDate(to)
                .totalAmount(BigDecimal.ZERO)
                .transactionCount(0L)
                .transactions(List.of())
                .build();
    }

    private CustomerSupplierDto convertToDto(CustomerSupplier entity) {
        return CustomerSupplierDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .taxNo(entity.getTaxNo())
                .address(entity.getAddress())
                .isCustomer(entity.getIsCustomer())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
