package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ürün/Hizmet kodu

    @Column(nullable = false)
    private String name; // Ürün/Hizmet adı

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type; // PRODUCT, SERVICE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private ProductCategory category; // Kategori

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id")
    private Unit unit; // Birim (adet, kg, litre)

    @Column(precision = 15, scale = 2)
    private BigDecimal purchasePrice; // Alış fiyatı

    @Column(precision = 15, scale = 2)
    private BigDecimal salePrice; // Satış fiyatı

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tax_rate_id")
    private TaxRate taxRate; // KDV oranı

    @Column(precision = 15, scale = 2)
    private BigDecimal stockQuantity; // Stok miktarı

    @Column(precision = 15, scale = 2)
    private BigDecimal minStockLevel; // Minimum stok seviyesi

    @Column(nullable = false)
    private Boolean active = true; // Aktif/Pasif

    @Column(columnDefinition = "TEXT")
    private String description; // Açıklama

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (stockQuantity == null) {
            stockQuantity = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
