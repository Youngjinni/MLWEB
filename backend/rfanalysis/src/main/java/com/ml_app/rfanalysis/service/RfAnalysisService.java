package com.ml_app.rfanalysis.service;

import com.ml_app.commonmodule.entity.RfEntity;
import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.RfRepository;
import com.ml_app.commonmodule.repository.UserRepository;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RfAnalysisService {

    // 수정: 필드 전부 클래스 최상단에 선언 (기존엔 userRepository가 메서드 사이에 선언됨)
    private final RfRepository rfRepository;
    private final UserRepository userRepository;

    @Transactional
    public void saveRfResult(RfAnalysisRequest dto, Long userId) {
        Integer nEstimators = (dto.getNEstimators() == null) ? 100 : dto.getNEstimators();

        RfEntity entity = RfEntity.builder()
                .analId(System.currentTimeMillis()) // TODO: Oracle SEQUENCE로 교체 예정
                .userId(userId)
                .inputDataNm(dto.getInputDataNm())
                .nEstimators(nEstimators)
                .maxDepth(dto.getMaxDepth())
                .minSamplesSplit(dto.getMinSamplesSplit())
                .criterion(dto.getCriterion() == null ? "gini" : dto.getCriterion())
                .accuracy(dto.getAccuracy())
                .resultJson(dto.getResultJson())
                .graphUrl(dto.getGraphUrl())
                .build();

        rfRepository.save(entity);
    }

    public List<RfEntity> getHistoryByUserId(Long userId) {
        return rfRepository.findByUserIdOrderByCrtrDtDesc(userId);
    }

    /**
     * 수정: .orElse(1L) → .orElseThrow()
     * 유저를 찾지 못할 경우 데이터 오염(userId=1번으로 저장)이 발생하는 버그 수정.
     */
    public void saveRfResultWithUsername(RfAnalysisRequest dto, String email) {
        Long userId = userRepository.findByEmail(email)
                .map(UserEntity::getUserId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));

        this.saveRfResult(dto, userId);
    }

    public List<RfEntity> getHistoryByUsername(String email) {
        Long userId = userRepository.findByEmail(email)
                .map(UserEntity::getUserId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));

        return rfRepository.findByUserIdOrderByCrtrDtDesc(userId);
    }
}
