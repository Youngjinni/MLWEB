package com.ml_app.rfanalysis.service;

import com.ml_app.commonmodule.entity.RfEntity;
import com.ml_app.commonmodule.repository.RfRepository;
import lombok.RequiredArgsConstructor;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RfAnalysisService {

    private final RfRepository rfRepository;

    @Transactional
    public void saveRfResult(RfAnalysisRequest dto, Long userId) {
        // [수정 포인트] null 방어 로직 추가 (기존에 null 들어오던 문제 해결)
        Integer nEstimators = (dto.getNEstimators() == null) ? 100 : dto.getNEstimators();

        RfEntity entity = RfEntity.builder()
                .analId(System.currentTimeMillis())
                .userId(userId)
                .inputDataNm(dto.getInputDataNm())
                .nEstimators(nEstimators) // 안전하게 확보된 값 사용
                .maxDepth(dto.getMaxDepth())
                .minSamplesSplit(dto.getMinSamplesSplit())
                .criterion(dto.getCriterion() == null ? "gini" : dto.getCriterion())
                .accuracy(dto.getAccuracy())
                .resultJson(dto.getResultJson())
                .graphUrl(dto.getGraphUrl())
                .build();

        rfRepository.save(entity);
    }
    private final UserRepository userRepository;
    // 💡 [새로 추가] 특정 사용자의 분석 이력을 가져오는 메서드
    public List<RfEntity> getHistoryByUserId(Long userId) {
        // 최신순으로 정렬해서 가져오도록 Repository에 메서드가 선언되어 있어야 함
        return rfRepository.findByUserIdOrderByCrtrDtDesc(userId);
    }
    public void saveRfResultWithUsername(RfAnalysisRequest dto, String username) {
        // 1. 기존 UserRepository를 사용해 username으로 유저 ID 찾기
        // 만약 UserRepository가 없다면 직접 DB에서 가져와야 하지만, 보통 하나쯤은 있으니까요!
        Long userId = userRepository.findByEmail(username)
                .map(UserEntity::getUserId)
                .orElse(1L);

        // 2. 영진님이 이미 짜두신 기존 메서드 그대로 호출!
        this.saveRfResult(dto, userId);
    }

    public List<RfEntity> getHistoryByUsername(String username) {
        Long userId = userRepository.findByEmail(username)
                .map(UserEntity::getUserId)
                .orElse(1L);

        // 리포지토리의 기본 메서드 활용
        return rfRepository.findByUserIdOrderByCrtrDtDesc(userId);
    }
}