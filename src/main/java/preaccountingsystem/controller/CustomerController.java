package preaccountingsystem.controller;

import preaccountingsystem.dto.InvoiceCreateRequest;
import preaccountingsystem.dto.InvoiceDto;
import preaccountingsystem.dto.SummaryReportResponse;
import preaccountingsystem.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping("/invoices")
    public ResponseEntity<InvoiceDto> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        return new ResponseEntity<>(customerService.createInvoice(request), HttpStatus.CREATED);
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDto>> listMyInvoices() {
        return ResponseEntity.ok(customerService.listMyInvoices());
    }

    @GetMapping("/invoices/by-type")
    public ResponseEntity<List<InvoiceDto>> listMyInvoicesByType(@RequestParam String type) {
        return ResponseEntity.ok(customerService.listMyInvoicesByType(type));
    }

    @GetMapping("/report/summary")
    public ResponseEntity<SummaryReportResponse> getMyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(customerService.getMyReport(from, to));
    }
}
