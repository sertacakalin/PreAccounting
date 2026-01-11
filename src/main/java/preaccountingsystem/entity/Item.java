package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing an inventory item (product or service).
 * Items are company-specific and can be either PRODUCT (with stock) or SERVICE (without stock).
 */
@Entity
@Table(name = "items", indexes = {
        @Index(name = "idx_item_company", columnList = "company_id"),
        @Index(name = "idx_item_type", columnList = "type"),
        @Index(name = "idx_item_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemType type;

    @Column(length = 100)
    private String category;

    /**
     * Stock quantity - only applicable for PRODUCT type
     * NULL for SERVICE type
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal stock;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ItemStatus status = ItemStatus.ACTIVE;

    /**
     * The company that owns this item
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Customer company;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
