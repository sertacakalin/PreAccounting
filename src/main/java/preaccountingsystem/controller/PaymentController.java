package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CreatePaymentRequest;
import preaccountingsystem.dto.PaymentDto;
import preaccountingsystem.entity.PaymentType;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.PaymentService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDto> create(
            @Valid @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        PaymentDto created = paymentService.createPayment(
                request,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> listAll(
            @RequestParam(required = false) PaymentType type,
            @RequestParam(required = false) Long customerSupplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<PaymentDto> result = paymentService.listAll(
                currentUser.getCustomer().getId(),
                type,
                customerSupplierId,
                startDate,
                endDate
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        PaymentDto result = paymentService.getById(
                id,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentDto>> getByInvoice(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<PaymentDto> result = paymentService.getPaymentsByInvoice(
                invoiceId,
                currentUser.getCustomer().getId()
        );
        return ResponseEntity.ok(result);
    }
}
