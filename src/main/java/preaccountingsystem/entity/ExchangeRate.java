package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates",
       uniqueConstraints = @UniqueConstraint(columnNames = {"from_currency", "to_currency", "rate_date"}),
       indexes = {
           @Index(name = "idx_exchange_rate_currencies", columnList = "from_currency, to_currency"),
           @Index(name = "idx_exchange_rate_date", columnList = "rate_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3)
    private String fromCurrency; // Base currency code

    @Column(nullable = false, length = 3)
    private String toCurrency; // Target currency code

    @Column(nullable = false, precision = 20, scale = 10)
    private BigDecimal rate; // Exchange rate with high precision

    @Column(nullable = false)
    private LocalDate rateDate; // Date of the rate

    @Column(length = 50)
    private String source; // API source (e.g., "ExchangeRate-API", "Manual")

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
