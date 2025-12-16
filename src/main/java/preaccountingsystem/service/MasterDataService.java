package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.*;
import preaccountingsystem.entity.*;
import preaccountingsystem.exception.BusinessException;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final UnitRepository unitRepository;
    private final TaxRateRepository taxRateRepository;
    private final CurrencyRepository currencyRepository;

    // ==================== ACCOUNT METHODS ====================

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        if (accountRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir cari hesap zaten mevcut: " + request.getCode());
        }

        Account account = Account.builder()
                .code(request.getCode())
                .name(request.getName())
                .type(request.getType())
                .taxNo(request.getTaxNo())
                .taxOffice(request.getTaxOffice())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .creditLimit(request.getCreditLimit())
                .active(request.getActive() != null ? request.getActive() : true)
                .notes(request.getNotes())
                .build();

        account = accountRepository.save(account);
        return toAccountResponse(account);
    }

    @Transactional
    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cari hesap bulunamadı: " + id));

        if (!account.getCode().equals(request.getCode()) && accountRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir cari hesap zaten mevcut: " + request.getCode());
        }

        account.setCode(request.getCode());
        account.setName(request.getName());
        account.setType(request.getType());
        account.setTaxNo(request.getTaxNo());
        account.setTaxOffice(request.getTaxOffice());
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setMobile(request.getMobile());
        account.setAddress(request.getAddress());
        account.setCity(request.getCity());
        account.setCountry(request.getCountry());
        account.setCreditLimit(request.getCreditLimit());
        account.setActive(request.getActive());
        account.setNotes(request.getNotes());

        account = accountRepository.save(account);
        return toAccountResponse(account);
    }

    public AccountResponse getAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cari hesap bulunamadı: " + id));
        return toAccountResponse(account);
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toAccountResponse)
                .collect(Collectors.toList());
    }

    public List<AccountResponse> getActiveAccounts() {
        return accountRepository.findByActive(true).stream()
                .map(this::toAccountResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cari hesap bulunamadı: " + id);
        }
        accountRepository.deleteById(id);
    }

    // ==================== PRODUCT METHODS ====================

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir ürün/hizmet zaten mevcut: " + request.getCode());
        }

        Product product = Product.builder()
                .code(request.getCode())
                .name(request.getName())
                .type(request.getType())
                .purchasePrice(request.getPurchasePrice())
                .salePrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .minStockLevel(request.getMinStockLevel())
                .active(request.getActive() != null ? request.getActive() : true)
                .description(request.getDescription())
                .build();

        if (request.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getUnitId() != null) {
            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Birim bulunamadı: " + request.getUnitId()));
            product.setUnit(unit);
        }

        if (request.getTaxRateId() != null) {
            TaxRate taxRate = taxRateRepository.findById(request.getTaxRateId())
                    .orElseThrow(() -> new ResourceNotFoundException("KDV oranı bulunamadı: " + request.getTaxRateId()));
            product.setTaxRate(taxRate);
        }

        product = productRepository.save(product);
        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün/Hizmet bulunamadı: " + id));

        if (!product.getCode().equals(request.getCode()) && productRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir ürün/hizmet zaten mevcut: " + request.getCode());
        }

        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setType(request.getType());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSalePrice(request.getSalePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setMinStockLevel(request.getMinStockLevel());
        product.setActive(request.getActive());
        product.setDescription(request.getDescription());

        if (request.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getUnitId() != null) {
            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Birim bulunamadı: " + request.getUnitId()));
            product.setUnit(unit);
        } else {
            product.setUnit(null);
        }

        if (request.getTaxRateId() != null) {
            TaxRate taxRate = taxRateRepository.findById(request.getTaxRateId())
                    .orElseThrow(() -> new ResourceNotFoundException("KDV oranı bulunamadı: " + request.getTaxRateId()));
            product.setTaxRate(taxRate);
        } else {
            product.setTaxRate(null);
        }

        product = productRepository.save(product);
        return toProductResponse(product);
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün/Hizmet bulunamadı: " + id));
        return toProductResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActive(true).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ürün/Hizmet bulunamadı: " + id);
        }
        productRepository.deleteById(id);
    }

    // ==================== PRODUCT CATEGORY METHODS ====================

    @Transactional
    public ProductCategoryResponse createProductCategory(ProductCategoryRequest request) {
        if (productCategoryRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir kategori zaten mevcut: " + request.getCode());
        }

        ProductCategory category = ProductCategory.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        category = productCategoryRepository.save(category);
        return toProductCategoryResponse(category);
    }

    @Transactional
    public ProductCategoryResponse updateProductCategory(Long id, ProductCategoryRequest request) {
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));

        if (!category.getCode().equals(request.getCode()) && productCategoryRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir kategori zaten mevcut: " + request.getCode());
        }

        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.getActive());

        category = productCategoryRepository.save(category);
        return toProductCategoryResponse(category);
    }

    public ProductCategoryResponse getProductCategory(Long id) {
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        return toProductCategoryResponse(category);
    }

    public List<ProductCategoryResponse> getAllProductCategories() {
        return productCategoryRepository.findAll().stream()
                .map(this::toProductCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProductCategory(Long id) {
        if (!productCategoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Kategori bulunamadı: " + id);
        }
        productCategoryRepository.deleteById(id);
    }

    // ==================== UNIT METHODS ====================

    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        if (unitRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir birim zaten mevcut: " + request.getCode());
        }

        Unit unit = Unit.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        unit = unitRepository.save(unit);
        return toUnitResponse(unit);
    }

    @Transactional
    public UnitResponse updateUnit(Long id, UnitRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Birim bulunamadı: " + id));

        if (!unit.getCode().equals(request.getCode()) && unitRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir birim zaten mevcut: " + request.getCode());
        }

        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setDescription(request.getDescription());
        unit.setActive(request.getActive());

        unit = unitRepository.save(unit);
        return toUnitResponse(unit);
    }

    public UnitResponse getUnit(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Birim bulunamadı: " + id));
        return toUnitResponse(unit);
    }

    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::toUnitResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUnit(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Birim bulunamadı: " + id);
        }
        unitRepository.deleteById(id);
    }

    // ==================== TAX RATE METHODS ====================

    @Transactional
    public TaxRateResponse createTaxRate(TaxRateRequest request) {
        if (taxRateRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir KDV oranı zaten mevcut: " + request.getCode());
        }

        TaxRate taxRate = TaxRate.builder()
                .code(request.getCode())
                .name(request.getName())
                .rate(request.getRate())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        taxRate = taxRateRepository.save(taxRate);
        return toTaxRateResponse(taxRate);
    }

    @Transactional
    public TaxRateResponse updateTaxRate(Long id, TaxRateRequest request) {
        TaxRate taxRate = taxRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KDV oranı bulunamadı: " + id));

        if (!taxRate.getCode().equals(request.getCode()) && taxRateRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir KDV oranı zaten mevcut: " + request.getCode());
        }

        taxRate.setCode(request.getCode());
        taxRate.setName(request.getName());
        taxRate.setRate(request.getRate());
        taxRate.setDescription(request.getDescription());
        taxRate.setActive(request.getActive());

        taxRate = taxRateRepository.save(taxRate);
        return toTaxRateResponse(taxRate);
    }

    public TaxRateResponse getTaxRate(Long id) {
        TaxRate taxRate = taxRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KDV oranı bulunamadı: " + id));
        return toTaxRateResponse(taxRate);
    }

    public List<TaxRateResponse> getAllTaxRates() {
        return taxRateRepository.findAll().stream()
                .map(this::toTaxRateResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTaxRate(Long id) {
        if (!taxRateRepository.existsById(id)) {
            throw new ResourceNotFoundException("KDV oranı bulunamadı: " + id);
        }
        taxRateRepository.deleteById(id);
    }

    // ==================== CURRENCY METHODS ====================

    @Transactional
    public CurrencyResponse createCurrency(CurrencyRequest request) {
        if (currencyRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir para birimi zaten mevcut: " + request.getCode());
        }

        Currency currency = Currency.builder()
                .code(request.getCode())
                .name(request.getName())
                .symbol(request.getSymbol())
                .active(request.getActive() != null ? request.getActive() : true)
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        currency = currencyRepository.save(currency);
        return toCurrencyResponse(currency);
    }

    @Transactional
    public CurrencyResponse updateCurrency(Long id, CurrencyRequest request) {
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Para birimi bulunamadı: " + id));

        if (!currency.getCode().equals(request.getCode()) && currencyRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Bu kod ile bir para birimi zaten mevcut: " + request.getCode());
        }

        currency.setCode(request.getCode());
        currency.setName(request.getName());
        currency.setSymbol(request.getSymbol());
        currency.setActive(request.getActive());
        currency.setIsDefault(request.getIsDefault());

        currency = currencyRepository.save(currency);
        return toCurrencyResponse(currency);
    }

    public CurrencyResponse getCurrency(Long id) {
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Para birimi bulunamadı: " + id));
        return toCurrencyResponse(currency);
    }

    public List<CurrencyResponse> getAllCurrencies() {
        return currencyRepository.findAll().stream()
                .map(this::toCurrencyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCurrency(Long id) {
        if (!currencyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Para birimi bulunamadı: " + id);
        }
        currencyRepository.deleteById(id);
    }

    // ==================== CONVERTER METHODS ====================

    private AccountResponse toAccountResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .code(account.getCode())
                .name(account.getName())
                .type(account.getType())
                .taxNo(account.getTaxNo())
                .taxOffice(account.getTaxOffice())
                .email(account.getEmail())
                .phone(account.getPhone())
                .mobile(account.getMobile())
                .address(account.getAddress())
                .city(account.getCity())
                .country(account.getCountry())
                .creditLimit(account.getCreditLimit())
                .balance(account.getBalance())
                .active(account.getActive())
                .notes(account.getNotes())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    private ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .type(product.getType())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .unitId(product.getUnit() != null ? product.getUnit().getId() : null)
                .unitName(product.getUnit() != null ? product.getUnit().getName() : null)
                .purchasePrice(product.getPurchasePrice())
                .salePrice(product.getSalePrice())
                .taxRateId(product.getTaxRate() != null ? product.getTaxRate().getId() : null)
                .taxRateName(product.getTaxRate() != null ? product.getTaxRate().getName() : null)
                .taxRateValue(product.getTaxRate() != null ? product.getTaxRate().getRate() : null)
                .stockQuantity(product.getStockQuantity())
                .minStockLevel(product.getMinStockLevel())
                .active(product.getActive())
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductCategoryResponse toProductCategoryResponse(ProductCategory category) {
        return ProductCategoryResponse.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .build();
    }

    private UnitResponse toUnitResponse(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .description(unit.getDescription())
                .active(unit.getActive())
                .createdAt(unit.getCreatedAt())
                .build();
    }

    private TaxRateResponse toTaxRateResponse(TaxRate taxRate) {
        return TaxRateResponse.builder()
                .id(taxRate.getId())
                .code(taxRate.getCode())
                .name(taxRate.getName())
                .rate(taxRate.getRate())
                .description(taxRate.getDescription())
                .active(taxRate.getActive())
                .createdAt(taxRate.getCreatedAt())
                .build();
    }

    private CurrencyResponse toCurrencyResponse(Currency currency) {
        return CurrencyResponse.builder()
                .id(currency.getId())
                .code(currency.getCode())
                .name(currency.getName())
                .symbol(currency.getSymbol())
                .active(currency.getActive())
                .isDefault(currency.getIsDefault())
                .createdAt(currency.getCreatedAt())
                .build();
    }
}
