package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "ML_USER")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserEntity {

    @Id
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "ID", nullable = false, unique = true, length = 64)
    private String id;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 64)
    private String email;

    @Column(name = "NM", nullable = false, length = 64)
    private String nm;

    @Column(name = "PW", nullable = false, length = 128)
    private String pw;

    @Builder.Default
    @Column(name = "SUBSC_YN")
    private Integer subscYn = 0;

    @Column(name = "SUBSC_DT")
    private LocalDateTime subscDt;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;

    /** PaymentService에서 결제 성공/실패/취소 시 호출 */
    public void updateSubscription(boolean active) {
        this.subscYn  = active ? 1 : 0;
        this.subscDt  = active ? LocalDateTime.now() : null;
    }
}
