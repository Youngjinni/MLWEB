package com.ml_app.lstmanalysis.service;


import com.ml_app.commonmodule.entity.LstmEntity;
import com.ml_app.commonmodule.repository.LstmRepository;
import lombok.RequiredArgsConstructor;
import com.ml_app.lstmanalysis.dto.LstmAnalysisRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LstmAnalysisService {

    private final LstmRepository lstmRepository;

    @Transactional
    public void saveAnalysisResult(LstmAnalysisRequest dto, Long userId) {
        // common 모듈의 LstmEntity 빌더 활용
        LstmEntity entity = LstmEntity.builder()
                .analId(System.currentTimeMillis()) // 임시 ID 생성 (DB Sequence가 없다면)
                .userId(userId)
                .inputDataNm(dto.getInputDataNm())
                .windowSize(dto.getWindowSize())
                .hiddenLayers(dto.getHiddenLayers())
                .neurons(dto.getNeurons())
                .epochs(dto.getEpochs())
                .batchSize(dto.getBatchSize())
                .learningRate(dto.getLearningRate())
                .optimizer(dto.getOptimizer())
                .resultJson(dto.getResultJson())
                .lossVal(0.0) // 필요 시 리액트에서 받아와서 세팅
                .build();

        lstmRepository.save(entity);
    }
}