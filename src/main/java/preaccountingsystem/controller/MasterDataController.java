package preaccountingsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.*;
import preaccountingsystem.service.MasterDataService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/master-data")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    // ==================== ACCOUNTS ====================

    @PostMapping("/accounts")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountRequest request) {
        return new ResponseEntity<>(masterDataService.createAccount(request), HttpStatus.CREATED);
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.ok(masterDataService.updateAccount(id, request));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getAccount(id));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountResponse>> getAllAccounts(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(masterDataService.getActiveAccounts());
        }
        return ResponseEntity.ok(masterDataService.getAllAccounts());
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        masterDataService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== PRODUCTS ====================

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return new ResponseEntity<>(masterDataService.createProduct(request), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(masterDataService.updateProduct(id, request));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getProduct(id));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(masterDataService.getActiveProducts());
        }
        return ResponseEntity.ok(masterDataService.getAllProducts());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        masterDataService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== PRODUCT CATEGORIES ====================

    @PostMapping("/product-categories")
    public ResponseEntity<ProductCategoryResponse> createProductCategory(@Valid @RequestBody ProductCategoryRequest request) {
        return new ResponseEntity<>(masterDataService.createProductCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/product-categories/{id}")
    public ResponseEntity<ProductCategoryResponse> updateProductCategory(@PathVariable Long id, @Valid @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(masterDataService.updateProductCategory(id, request));
    }

    @GetMapping("/product-categories/{id}")
    public ResponseEntity<ProductCategoryResponse> getProductCategory(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getProductCategory(id));
    }

    @GetMapping("/product-categories")
    public ResponseEntity<List<ProductCategoryResponse>> getAllProductCategories() {
        return ResponseEntity.ok(masterDataService.getAllProductCategories());
    }

    @DeleteMapping("/product-categories/{id}")
    public ResponseEntity<Void> deleteProductCategory(@PathVariable Long id) {
        masterDataService.deleteProductCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== UNITS ====================

    @PostMapping("/units")
    public ResponseEntity<UnitResponse> createUnit(@Valid @RequestBody UnitRequest request) {
        return new ResponseEntity<>(masterDataService.createUnit(request), HttpStatus.CREATED);
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<UnitResponse> updateUnit(@PathVariable Long id, @Valid @RequestBody UnitRequest request) {
        return ResponseEntity.ok(masterDataService.updateUnit(id, request));
    }

    @GetMapping("/units/{id}")
    public ResponseEntity<UnitResponse> getUnit(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getUnit(id));
    }

    @GetMapping("/units")
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        return ResponseEntity.ok(masterDataService.getAllUnits());
    }

    @DeleteMapping("/units/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        masterDataService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== TAX RATES ====================

    @PostMapping("/tax-rates")
    public ResponseEntity<TaxRateResponse> createTaxRate(@Valid @RequestBody TaxRateRequest request) {
        return new ResponseEntity<>(masterDataService.createTaxRate(request), HttpStatus.CREATED);
    }

    @PutMapping("/tax-rates/{id}")
    public ResponseEntity<TaxRateResponse> updateTaxRate(@PathVariable Long id, @Valid @RequestBody TaxRateRequest request) {
        return ResponseEntity.ok(masterDataService.updateTaxRate(id, request));
    }

    @GetMapping("/tax-rates/{id}")
    public ResponseEntity<TaxRateResponse> getTaxRate(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getTaxRate(id));
    }

    @GetMapping("/tax-rates")
    public ResponseEntity<List<TaxRateResponse>> getAllTaxRates() {
        return ResponseEntity.ok(masterDataService.getAllTaxRates());
    }

    @DeleteMapping("/tax-rates/{id}")
    public ResponseEntity<Void> deleteTaxRate(@PathVariable Long id) {
        masterDataService.deleteTaxRate(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== CURRENCIES ====================

    @PostMapping("/currencies")
    public ResponseEntity<CurrencyResponse> createCurrency(@Valid @RequestBody CurrencyRequest request) {
        return new ResponseEntity<>(masterDataService.createCurrency(request), HttpStatus.CREATED);
    }

    @PutMapping("/currencies/{id}")
    public ResponseEntity<CurrencyResponse> updateCurrency(@PathVariable Long id, @Valid @RequestBody CurrencyRequest request) {
        return ResponseEntity.ok(masterDataService.updateCurrency(id, request));
    }

    @GetMapping("/currencies/{id}")
    public ResponseEntity<CurrencyResponse> getCurrency(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getCurrency(id));
    }

    @GetMapping("/currencies")
    public ResponseEntity<List<CurrencyResponse>> getAllCurrencies() {
        return ResponseEntity.ok(masterDataService.getAllCurrencies());
    }

    @DeleteMapping("/currencies/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        masterDataService.deleteCurrency(id);
        return ResponseEntity.noContent().build();
    }
}
