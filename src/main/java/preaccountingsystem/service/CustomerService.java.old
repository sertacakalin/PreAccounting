package preaccountingsystem.service;

import preaccountingsystem.dto.InvoiceCreateRequest;
import preaccountingsystem.dto.InvoiceDto;
import preaccountingsystem.dto.SummaryReportResponse;
import preaccountingsystem.entity.Customer;
import preaccountingsystem.entity.Invoice;
import preaccountingsystem.entity.InvoiceType;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.UnauthorizedException;
import preaccountingsystem.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceDto createInvoice(InvoiceCreateRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Customer customer = user.getCustomer();

        if (customer == null) {
            throw new UnauthorizedException("Current user is not associated with a customer");
        }

        Invoice invoice = Invoice.builder()
                .customer(customer)
                .type(request.getType())
                .date(request.getDate())
                .amount(request.getAmount())
                .description(request.getDescription())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return convertToInvoiceDto(savedInvoice);
    }

    public List<InvoiceDto> listMyInvoices() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Customer customer = user.getCustomer();

        if (customer == null) {
            throw new UnauthorizedException("Current user is not associated with a customer");
        }

        return invoiceRepository.findByCustomerId(customer.getId()).stream()
                .map(this::convertToInvoiceDto)
                .collect(Collectors.toList());
    }

    public List<InvoiceDto> listMyInvoicesByType(String type) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Customer customer = user.getCustomer();

        if (customer == null) {
            throw new UnauthorizedException("Current user is not associated with a customer");
        }

        InvoiceType invoiceType = InvoiceType.valueOf(type.toUpperCase());
        
        return invoiceRepository.findByCustomerId(customer.getId()).stream()
                .filter(invoice -> invoice.getType() == invoiceType)
                .map(this::convertToInvoiceDto)
                .collect(Collectors.toList());
    }

    public SummaryReportResponse getMyReport(LocalDate from, LocalDate to) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Customer customer = user.getCustomer();

        if (customer == null) {
            throw new UnauthorizedException("Current user is not associated with a customer");
        }

        List<Invoice> invoices = invoiceRepository.findByCustomerIdAndDateBetween(customer.getId(), from, to);
        
        BigDecimal totalIncome = invoices.stream()
                .filter(i -> i.getType() == InvoiceType.INCOME)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = invoices.stream()
                .filter(i -> i.getType() == InvoiceType.EXPENSE)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        return SummaryReportResponse.builder()
                .fromDate(from)
                .toDate(to)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netProfit(netProfit)
                .invoiceCount((long) invoices.size())
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
}
