package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    /** 사용자의 등록된 빌링키 조회 (가장 최근 것) */
    @Query("SELECT p FROM PaymentEntity p WHERE p.userId = :userId AND p.status = 'BILLING_KEY' ORDER BY p.crtrDt DESC")
    Optional<PaymentEntity> findActiveBillingKey(@Param("userId") Long userId);

    /** 결제 이력 조회 */
    List<PaymentEntity> findByUserIdAndStatusOrderByCrtrDtDesc(Long userId, String status);

    /** 전체 결제 이력 */
    List<PaymentEntity> findByUserIdOrderByCrtrDtDesc(Long userId);
}
