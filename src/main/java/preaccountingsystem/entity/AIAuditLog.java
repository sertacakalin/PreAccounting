package preaccountingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_audit_logs", indexes = {
    @Index(name = "idx_ai_audit_user", columnList = "user_id"),
    @Index(name = "idx_ai_audit_company", columnList = "company_id"),
    @Index(name = "idx_ai_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_ai_audit_company_timestamp", columnList = "company_id, timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String query;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String response;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    // User who made the query
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Company context
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Customer company;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
