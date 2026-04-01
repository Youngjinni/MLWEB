package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.PayHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayHistoryRepository extends JpaRepository<PayHistoryEntity, Long> {

    // 1. 특정 유저의 결제 내역을 최신순으로 조회
    List<PayHistoryEntity> findByUserIdOrderByPaidDtDesc(Long userId);

    // 2. 토스 결제 키로 내역 찾기 (결제 승인 후 상태 변경 시 필요)
    Optional<PayHistoryEntity> findByPaymentKey(String paymentKey);

    // 3. 특정 유저의 현재 유효한(성공한) 결제가 있는지 확인
    boolean existsByUserIdAndStatus(Long userId, String status);
}