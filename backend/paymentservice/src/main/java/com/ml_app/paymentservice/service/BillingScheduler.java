package com.ml_app.paymentservice.service;

import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillingScheduler {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    /**
     * 매월 1일 오전 9시에 구독 중인 모든 유저 자동결제
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 9 1 * *")
    public void monthlyBilling() {
        log.info("=== 월 정기결제 시작 ===");

        List<UserEntity> subscribers = userRepository.findBySubscYn(1);
        log.info("구독 중인 유저 수: {}", subscribers.size());

        int success = 0, fail = 0;
        for (UserEntity user : subscribers) {
            try {
                paymentService.processMonthlyBilling(user);
                success++;
            } catch (Exception e) {
                log.error("자동결제 실패 - userId: {}, error: {}", user.getUserId(), e.getMessage());
                fail++;
            }
        }

        log.info("=== 월 정기결제 완료 - 성공: {}, 실패: {} ===", success, fail);
    }
}
