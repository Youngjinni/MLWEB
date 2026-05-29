package com.ml_app.paymentservice.service;

import com.ml_app.commonmodule.entity.PaymentEntity;
import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.PaymentRepository;
import com.ml_app.commonmodule.repository.UserRepository;
import com.ml_app.paymentservice.client.TossPaymentClient;
import com.ml_app.paymentservice.dto.TossBillingKeyResponse;
import com.ml_app.paymentservice.dto.TossPaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository    userRepository;
    private final TossPaymentClient tossClient;

    @Value("${subscription.amount}")
    private Long subscriptionAmount;

    /**
     * Toss 빌링키 발급 + 첫 달 결제 처리
     * 프론트에서 카드 등록 완료 후 authKey, customerKey를 서버로 전달
     */
    @Transactional
    public void issueBillingKeyAndCharge(Long userId, String authKey, String customerKey) {
        // 1. 빌링키 발급
        TossBillingKeyResponse billingRes = tossClient.issueBillingKey(authKey, customerKey);
        String billingKey = billingRes.getBillingKey();

        // 2. 빌링키 저장 (STATUS = 'BILLING_KEY')
        PaymentEntity billingKeyRecord = PaymentEntity.builder()
            .payId(System.currentTimeMillis())
            .userId(userId)
            .paymentKey(billingKey)
            .orderName("카드 등록 - " + billingRes.getCardCompany())
            .amount(0L)
            .method(billingRes.getMethod())
            .status("BILLING_KEY")
            .build();
        paymentRepository.save(billingKeyRecord);

        // 3. 첫 달 즉시 결제
        chargeUser(userId, billingKey, customerKey);
    }

    /**
     * 실제 결제 실행 (빌링키 필요)
     * 스케줄러와 첫 달 결제에서 공통으로 사용
     */
    @Transactional
    public void chargeUser(Long userId, String billingKey, String customerKey) {
        String orderId = "ML-SUB-" + userId + "-" + System.currentTimeMillis();

        try {
            TossPaymentResponse payRes = tossClient.chargeWithBillingKey(
                billingKey, customerKey, orderId, subscriptionAmount
            );

            // 결제 성공 기록
            LocalDateTime now      = LocalDateTime.now();
            LocalDateTime expireDt = now.plusMonths(1);

            PaymentEntity record = PaymentEntity.builder()
                .payId(System.currentTimeMillis() + 1)
                .userId(userId)
                .paymentKey(payRes.getPaymentKey())
                .orderName(payRes.getOrderName())
                .amount(payRes.getTotalAmount())
                .method(payRes.getMethod())
                .status("DONE")
                .paidDt(now)
                .expireDt(expireDt)
                .build();
            paymentRepository.save(record);

            // 구독 상태 활성화
            UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            user.updateSubscription(true);
            userRepository.save(user);

            log.info("결제 성공 - userId: {}, paymentKey: {}", userId, payRes.getPaymentKey());

        } catch (Exception e) {
            // 결제 실패 기록
            PaymentEntity failRecord = PaymentEntity.builder()
                .payId(System.currentTimeMillis() + 2)
                .userId(userId)
                .paymentKey("FAILED")
                .orderName("MLWeb Pro 구독")
                .amount(subscriptionAmount)
                .status("FAILED")
                .build();
            paymentRepository.save(failRecord);

            // 결제 실패 시 구독 비활성화
            userRepository.findById(userId).ifPresent(user -> {
                user.updateSubscription(false);
                userRepository.save(user);
            });

            log.error("결제 실패 - userId: {}, error: {}", userId, e.getMessage());
            throw new RuntimeException("결제 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /** 구독 취소: 빌링키 레코드 삭제 + 구독 상태 비활성화 */
    @Transactional
    public void cancelSubscription(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.updateSubscription(false);
            userRepository.save(user);
        });
        // 빌링키 레코드 상태를 CANCELLED로 변경
        paymentRepository.findActiveBillingKey(userId).ifPresent(key -> {
            key.updateStatus("CANCELLED");
            paymentRepository.save(key);
        });
        log.info("구독 취소 - userId: {}", userId);
    }

    /** 결제 이력 조회 */
    @Transactional(readOnly = true)
    public List<PaymentEntity> getPaymentHistory(Long userId) {
        return paymentRepository.findByUserIdOrderByCrtrDtDesc(userId);
    }

    /** 월 1일 자동결제 대상 유저 처리 (BillingScheduler에서 호출) */
    @Transactional
    public void processMonthlyBilling(UserEntity user) {
        Long userId = user.getUserId();
        String customerKey = "ml-" + userId;

        paymentRepository.findActiveBillingKey(userId).ifPresent(billingKeyRecord -> {
            chargeUser(userId, billingKeyRecord.getPaymentKey(), customerKey);
        });
    }
}
