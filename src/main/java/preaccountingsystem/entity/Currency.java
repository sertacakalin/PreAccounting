package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "currencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Currency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 3)
    private String code; // e.g., USD, EUR, TRY

    @Column(nullable = false)
    private String name; // e.g., US Dollar, Euro, Turkish Lira

    @Column(nullable = false)
    private String symbol; // e.g., $, €, ₺

    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
