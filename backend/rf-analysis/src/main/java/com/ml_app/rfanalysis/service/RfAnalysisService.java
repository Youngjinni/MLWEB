package com.ml_app.rfanalysis.service;

import com.ml_app.commonmodule.entity.RfEntity;
import com.ml_app.commonmodule.repository.RfRepository;
import lombok.RequiredArgsConstructor;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RfAnalysisService {

    private final RfRepository rfRepository;

    @Transactional
    public void saveRfResult(RfAnalysisRequest dto, Long userId) {
        // 엔티티의 필드 구성에 맞춰 빌더 패턴으로 생성
        System.out.println("DTO 수신 확인: " + dto.getNEstimators());
        RfEntity entity = RfEntity.builder()
                .analId(System.currentTimeMillis()) // 임시 ID 생성 전략
                .userId(userId)
                .inputDataNm(dto.getInputDataNm())
                .nEstimators(dto.getNEstimators())
                .maxDepth(dto.getMaxDepth())
                .minSamplesSplit(dto.getMinSamplesSplit())
                .criterion(dto.getCriterion())
                .accuracy(dto.getAccuracy())
                .resultJson(dto.getResultJson())
                .graphUrl(dto.getGraphUrl())
                .build();

        rfRepository.save(entity);
    }
}