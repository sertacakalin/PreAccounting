package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.CreatePaymentRequest;
import preaccountingsystem.dto.PaymentDto;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerSupplierRepository customerSupplierRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public PaymentDto createPayment(CreatePaymentRequest request, Long companyId) {
        // Validate company exists
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        // Validate customer/supplier exists and belongs to company
        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(
                request.getCustomerSupplierId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));

        // Validate payment type matches customer/supplier type
        if (request.getType() == PaymentType.COLLECTION && !customerSupplier.getIsCustomer()) {
            throw new BusinessException("Collections can only be made from customers, not suppliers");
        }
        if (request.getType() == PaymentType.PAYMENT && customerSupplier.getIsCustomer()) {
            throw new BusinessException("Payments can only be made to suppliers, not customers");
        }

        Invoice invoice = null;
        if (request.getInvoiceId() != null) {
            // Validate invoice exists and belongs to company
            invoice = invoiceRepository.findByIdAndCompanyId(request.getInvoiceId(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

            // Validate invoice belongs to the same customer/supplier
            if (!invoice.getCustomerSupplier().getId().equals(request.getCustomerSupplierId())) {
                throw new BusinessException("Invoice does not belong to the specified customer/supplier");
            }

            // Validate invoice is not cancelled
            if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
                throw new BusinessException("Cannot make payment for a cancelled invoice");
            }

            // Validate payment doesn't exceed remaining balance
            BigDecimal totalPaid = paymentRepository.getTotalPaymentsByInvoiceId(invoice.getId());
            BigDecimal remainingBalance = invoice.getTotalAmount().subtract(totalPaid);

            if (request.getAmount().compareTo(remainingBalance) > 0) {
                throw new BusinessException("Payment amount exceeds remaining invoice balance of " + remainingBalance);
            }
        }

        // Create payment
        Payment payment = Payment.builder()
                .type(request.getType())
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .customerSupplier(customerSupplier)
                .invoice(invoice)
                .company(company)
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update invoice status if fully paid
        if (invoice != null) {
            updateInvoiceStatus(invoice);
        }

        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> listAll(Long companyId, PaymentType type, Long customerSupplierId,
                                    LocalDate startDate, LocalDate endDate) {
        List<Payment> payments;

        if (type != null) {
            payments = paymentRepository.findByCompanyIdAndType(companyId, type);
        } else if (customerSupplierId != null) {
            payments = paymentRepository.findByCompanyIdAndCustomerSupplierId(companyId, customerSupplierId);
        } else if (startDate != null && endDate != null) {
            payments = paymentRepository.findByCompanyIdAndPaymentDateBetween(companyId, startDate, endDate);
        } else {
            payments = paymentRepository.findByCompanyId(companyId);
        }

        return payments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDto getById(Long id, Long companyId) {
        Payment payment = paymentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found or access denied"));
        return convertToDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByInvoice(Long invoiceId, Long companyId) {
        // Verify invoice belongs to company
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private void updateInvoiceStatus(Invoice invoice) {
        BigDecimal totalPaid = paymentRepository.getTotalPaymentsByInvoiceId(invoice.getId());

        // If total paid equals or exceeds invoice total, mark as paid
        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0 &&
            invoice.getStatus() != InvoiceStatus.PAID) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }
    }

    private PaymentDto convertToDto(Payment entity) {
        return PaymentDto.builder()
                .id(entity.getId())
                .type(entity.getType().name())
                .amount(entity.getAmount())
                .paymentDate(entity.getPaymentDate())
                .paymentMethod(entity.getPaymentMethod().name())
                .notes(entity.getNotes())
                .customerSupplierId(entity.getCustomerSupplier().getId())
                .customerSupplierName(entity.getCustomerSupplier().getName())
                .invoiceId(entity.getInvoice() != null ? entity.getInvoice().getId() : null)
                .invoiceNumber(entity.getInvoice() != null ? entity.getInvoice().getInvoiceNumber() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
