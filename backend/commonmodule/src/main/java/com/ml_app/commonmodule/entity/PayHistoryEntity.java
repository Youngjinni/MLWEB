package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_PAY_HIS")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PayHistoryEntity {

    @Id
    @Column(name = "PAY_ID")
    private Long payId; // 결제 고유 ID

    @Column(name = "USER_ID", nullable = false)
    private Long userId; // 결제한 유저 ID

    @Column(name = "PAYMENT_KEY")
    private String paymentKey; // 토스 결제 키 (승인/취소 시 필요)

    @Column(name = "ORDER_NAME")
    private String orderName; // 상품명 (예: 1개월 정기 구독)

    @Column(name = "AMOUNT", nullable = false)
    private Long amount; // 결제 금액

    @Column(name = "METHOD")
    private String method; // 결제 수단 (CARD, TRANSFER 등)

    @Builder.Default
    @Column(name = "STATUS")
    private String status = "READY"; // READY, DONE, CANCELED 등

    @Column(name = "PAID_DT")
    private LocalDateTime paidDt; // 실제 결제 승인 시각

    @Column(name = "EXPIRE_DT")
    private LocalDateTime expireDt; // 구독 만료 예정일

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt; // 데이터 생성 일시

    // --- 비즈니스 로직 ---

    /**
     * 결제 완료 처리
     */
    public void completePayment(String paymentKey, String method) {
        this.status = "DONE";
        this.paymentKey = paymentKey;
        this.method = method;
        this.paidDt = LocalDateTime.now();
        // 보통 결제 시점으로부터 30일 뒤 만료
        this.expireDt = this.paidDt.plusDays(30);
    }

    /**
     * 결제 취소 처리
     */
    public void cancelPayment() {
        this.status = "CANCELED";
    }
}