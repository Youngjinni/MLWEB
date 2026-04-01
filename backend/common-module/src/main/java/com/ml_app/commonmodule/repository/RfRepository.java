package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.RfEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RfRepository extends JpaRepository<RfEntity, Long> {

    // 특정 유저의 Random Forest 분석 결과만 모아보기
    List<RfEntity> findByUserIdOrderByCrtrDtDesc(Long userId);
}