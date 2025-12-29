package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String defaultCurrency;

    @ElementCollection
    @CollectionTable(name = "vat_rates", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "rate")
    @Builder.Default
    private List<Integer> vatRates = new ArrayList<>();

    @Column(nullable = false)
    private String invoiceNumberFormat;

    @Column(nullable = false)
    private Integer aiDailyLimit;

    @Column(nullable = false)
    private Integer aiMonthlyLimit;
}
