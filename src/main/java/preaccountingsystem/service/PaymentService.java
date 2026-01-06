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
        Customer company = customerRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        CustomerSupplier customerSupplier = customerSupplierRepository.findByIdAndCompanyId(
                request.getCustomerSupplierId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer/Supplier not found or access denied"));

        if (request.getType() == PaymentType.COLLECTION && !customerSupplier.getIsCustomer()) {
            throw new BusinessException("Collections can only be made from customers, not suppliers");
        }
        if (request.getType() == PaymentType.PAYMENT && customerSupplier.getIsCustomer()) {
            throw new BusinessException("Payments can only be made to suppliers, not customers");
        }

        Invoice invoice = null;
        if (request.getInvoiceId() != null) {
            invoice = invoiceRepository.findByIdAndCompanyId(request.getInvoiceId(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

            if (!invoice.getCustomerSupplier().getId().equals(request.getCustomerSupplierId())) {
                throw new BusinessException("Invoice does not belong to the specified customer/supplier");
            }

            if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
                throw new BusinessException("Cannot make payment for a cancelled invoice");
            }

            BigDecimal totalPaid = paymentRepository.getTotalPaymentsByInvoiceId(invoice.getId());
            BigDecimal remainingBalance = invoice.getTotalAmount().subtract(totalPaid);

            if (request.getAmount().compareTo(remainingBalance) > 0) {
                throw new BusinessException("Payment amount exceeds remaining invoice balance of " + remainingBalance);
            }
        }

        Payment payment = Payment.builder()
                .type(request.getType())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "USD")
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .customerSupplier(customerSupplier)
                .invoice(invoice)
                .company(company)
                .build();

        Payment saved = paymentRepository.save(payment);

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
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found or access denied"));

        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private void updateInvoiceStatus(Invoice invoice) {
        BigDecimal totalPaid = paymentRepository.getTotalPaymentsByInvoiceId(invoice.getId());

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
                .currency(entity.getCurrency())
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
