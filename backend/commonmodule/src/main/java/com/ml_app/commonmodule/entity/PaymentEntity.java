package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "ML_PAY_HIS")
@Getter
@Setter  // updateStatus가 직접 필드를 바꾸므로 @Setter 추가 or 명시적 메서드 사용
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PaymentEntity {

    @Id
    @Column(name = "PAY_ID")
    private Long payId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "PAYMENT_KEY", length = 255)
    private String paymentKey;

    @Column(name = "ORDER_NAME", length = 100)
    private String orderName;

    @Column(name = "AMOUNT", nullable = false)
    private Long amount;

    @Column(name = "METHOD", length = 20)
    private String method;

    @Builder.Default
    @Column(name = "STATUS", length = 20)
    private String status = "READY";

    @Column(name = "PAID_DT")
    private LocalDateTime paidDt;

    @Column(name = "EXPIRE_DT")
    private LocalDateTime expireDt;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;

    public void updateStatus(String status) {
        this.status = status;
    }
}
