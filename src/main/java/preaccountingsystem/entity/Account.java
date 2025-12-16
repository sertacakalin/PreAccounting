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
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Cari kodu (örn: C001, S001)

    @Column(nullable = false)
    private String name; // Firma/Kişi adı

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type; // CUSTOMER, SUPPLIER, BOTH

    @Column(length = 20)
    private String taxNo; // Vergi/TC No

    @Column(length = 50)
    private String taxOffice; // Vergi dairesi

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String mobile;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String country;

    @Column(precision = 15, scale = 2)
    private BigDecimal creditLimit; // Kredi limiti

    @Column(precision = 15, scale = 2)
    private BigDecimal balance; // Bakiye (alacak/borç)

    @Column(nullable = false)
    private Boolean active = true; // Aktif/Pasif

    @Column(columnDefinition = "TEXT")
    private String notes; // Notlar

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (balance == null) {
            balance = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
