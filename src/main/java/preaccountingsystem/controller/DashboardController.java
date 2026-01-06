package preaccountingsystem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.DashboardDto;
import preaccountingsystem.dto.ExpenseDistributionDto;
import preaccountingsystem.dto.MonthlyIncomeExpenseDto;
import preaccountingsystem.dto.UnpaidInvoiceSummaryDto;
import preaccountingsystem.entity.User;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.service.DashboardService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CUSTOMER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        if (startDate.isAfter(endDate)) {
            throw new BusinessException("Start date cannot be after end date");
        }

        DashboardDto dashboard = dashboardService.getDashboard(
                currentUser.getCustomer().getId(),
                startDate,
                endDate
        );

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyIncomeExpenseDto>> getMonthlyIncomeExpense(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<MonthlyIncomeExpenseDto> monthlyData = dashboardService.getMonthlyIncomeExpense(
                currentUser.getCustomer().getId(),
                startDate,
                endDate
        );

        return ResponseEntity.ok(monthlyData);
    }

    @GetMapping("/expense-distribution")
    public ResponseEntity<List<ExpenseDistributionDto>> getExpenseDistribution(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<ExpenseDistributionDto> distribution = dashboardService.getExpenseDistribution(
                currentUser.getCustomer().getId(),
                startDate,
                endDate
        );

        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/unpaid-invoices")
    public ResponseEntity<List<UnpaidInvoiceSummaryDto>> getUnpaidInvoices(
            @AuthenticationPrincipal User currentUser) {

        if (currentUser.getCustomer() == null) {
            throw new BusinessException("User is not associated with any company");
        }

        List<UnpaidInvoiceSummaryDto> unpaidInvoices = dashboardService.getUnpaidInvoices(
                currentUser.getCustomer().getId()
        );

        return ResponseEntity.ok(unpaidInvoices);
    }
}
