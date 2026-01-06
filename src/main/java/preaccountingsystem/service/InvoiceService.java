package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.CreateInvoiceRequest;
import preaccountingsystem.dto.InvoiceDto;
import preaccountingsystem.dto.InvoiceItemDto;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerSupplierRepository customerSupplierRepository;
    private final CustomerRepository customerRepository;
    private final SystemSettingsRepository systemSettingsRepository;

    @Transactional
    public InvoiceDto createInvoice(CreateInvoiceRequest request, Long companyId) {
        // Validate company exists
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        // Validate customer/supplier exists and belongs to company
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(
                request.getCustomerSupplierId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));

        // Validate customer/supplier is a customer (not supplier)
        if (!customerSupplier.getIsCustomer()) {
            throw new BusinessException("Invoices can only be created for customers, not suppliers");
        }

        // Validate due date is after invoice date
        if (request.getDueDate().isBefore(request.getInvoiceDate())) {
            throw new BusinessException("Due date cannot be before invoice date");
        }

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber(companyId);

        // Create invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .invoiceDate(request.getInvoiceDate())
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "USD")
                .status(InvoiceStatus.UNPAID)
                .customerSupplier(customerSupplier)
                .company(company)
                .build();

        // Add invoice items
        request.getItems().forEach(itemRequest -> {
            BigDecimal amount = itemRequest.getQuantity().multiply(itemRequest.getUnitPrice());
            InvoiceItem item = InvoiceItem.builder()
                    .description(itemRequest.getDescription())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .amount(amount)
                    .build();
            invoice.addItem(item);
        });

        Invoice saved = invoiceRepository.save(invoice);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> listAll(Long companyId) {
        return invoiceRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> listUnpaid(Long companyId) {
        List<InvoiceStatus> unpaidStatuses = Arrays.asList(InvoiceStatus.UNPAID);
        return invoiceRepository.findByCompanyIdAndStatusIn(companyId, unpaidStatuses).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceDto getById(Long id, Long companyId) {
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));
        return convertToDto(invoice);
    }

    @Transactional
    public InvoiceDto cancelInvoice(Long id, Long companyId) {
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Invoice is already cancelled");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("Cannot cancel a paid invoice");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        Invoice updated = invoiceRepository.save(invoice);
        return convertToDto(updated);
    }

    @Transactional
    public InvoiceDto markAsPaid(Long id, Long companyId) {
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Cannot mark a cancelled invoice as paid");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("Invoice is already paid");
        }

        invoice.setStatus(InvoiceStatus.PAID);
        Invoice updated = invoiceRepository.save(invoice);
        return convertToDto(updated);
    }

    private String generateInvoiceNumber(Long companyId) {
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseThrow(() -> new BusinessException("System settings not found"));

        String format = settings.getInvoiceNumberFormat();
        if (format == null || format.isEmpty()) {
            format = "INV-{YEAR}-{SEQUENCE}"; // Default format
        }

        int currentYear = Year.now().getValue();

        List<Invoice> latestInvoices = invoiceRepository.findLatestByCompanyId(companyId);
        int nextSequence = 1;

        if (!latestInvoices.isEmpty()) {
            Invoice lastInvoice = latestInvoices.get(0);
            String lastNumber = lastInvoice.getInvoiceNumber();


            String[] parts = lastNumber.split("-");
            if (parts.length > 0) {
                try {
                    String lastPart = parts[parts.length - 1];
                    int lastSequence = Integer.parseInt(lastPart);
                    nextSequence = lastSequence + 1;
                } catch (NumberFormatException e) {
                    // If parsing fails, start from 1
                    nextSequence = 1;
                }
            }
        }

        String invoiceNumber = format
                .replace("{YEAR}", String.valueOf(currentYear))
                .replace("{SEQUENCE}", String.format("%05d", nextSequence)); // 5-digit sequence with leading zeros

        while (invoiceRepository.findByInvoiceNumber(invoiceNumber).isPresent()) {
            nextSequence++;
            invoiceNumber = format
                    .replace("{YEAR}", String.valueOf(currentYear))
                    .replace("{SEQUENCE}", String.format("%05d", nextSequence));
        }

        return invoiceNumber;
    }

    private InvoiceDto convertToDto(Invoice entity) {
        List<InvoiceItemDto> items = entity.getItems().stream()
                .map(item -> InvoiceItemDto.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .amount(item.getAmount())
                        .build())
                .collect(Collectors.toList());

        return InvoiceDto.builder()
                .id(entity.getId())
                .invoiceNumber(entity.getInvoiceNumber())
                .invoiceDate(entity.getInvoiceDate())
                .dueDate(entity.getDueDate())
                .totalAmount(entity.getTotalAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus().name())
                .notes(entity.getNotes())
                .customerSupplierId(entity.getCustomerSupplier().getId())
                .customerSupplierName(entity.getCustomerSupplier().getName())
                .items(items)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
