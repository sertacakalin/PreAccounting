package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CreateInvoiceRequest;
import preaccountingsystem.dto.InvoiceDto;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.InvoiceService;
import preaccountingsystem.service.InvoicePdfService;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;

    @PostMapping
    public ResponseEntity<InvoiceDto> create(
            @Valid @RequestBody CreateInvoiceRequest request,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        InvoiceDto created = invoiceService.createInvoice(
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDto>> listAll(
            @RequestParam(required = false, defaultValue = "false") boolean unpaidOnly,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<InvoiceDto> result;
        if (unpaidOnly) {
            result = invoiceService.listUnpaid(currentUser.getCustomer().getId());
        } else {
            result = invoiceService.listAll(currentUser.getCustomer().getId());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        InvoiceDto result = invoiceService.getById(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<InvoiceDto> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        InvoiceDto updated = invoiceService.cancelInvoice(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/mark-paid")
    public ResponseEntity<InvoiceDto> markAsPaid(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        InvoiceDto updated = invoiceService.markAsPaid(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        // Get invoice
        InvoiceDto invoice = invoiceService.getById(
                id,
                currentUser.getCustomer().getId()
        );

        // Generate PDF
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        // Set headers for PDF download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + invoice.getInvoiceNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
