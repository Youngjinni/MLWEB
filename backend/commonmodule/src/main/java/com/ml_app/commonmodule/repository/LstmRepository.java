package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.LstmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LstmRepository extends JpaRepository<LstmEntity, Long> {

    // 특정 유저의 모든 분석 기록을 최신순으로 조회
    List<LstmEntity> findByUserIdOrderByCrtrDtDesc(Long userId);
}