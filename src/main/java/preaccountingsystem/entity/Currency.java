package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "currencies")
public class Currency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 3)
    private String code; // Para birimi kodu (TRY, USD, EUR)

    @Column(nullable = false, length = 50)
    private String name; // Para birimi adı (Türk Lirası, ABD Doları, Euro)

    @Column(length = 10)
    private String symbol; // Sembol (₺, $, €)

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean isDefault = false; // Varsayılan para birimi

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
