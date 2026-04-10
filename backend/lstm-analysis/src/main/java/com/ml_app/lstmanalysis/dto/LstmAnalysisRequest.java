package com.ml_app.lstmanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LstmAnalysisRequest {

    // 1. 데이터 정보
    private String inputDataNm;    // 입력 데이터 파일명

    // 2. 하이퍼파라미터 (Entity의 필드 타입과 매칭)
    private Integer windowSize;    // 데이터 윈도우 크기
    private Integer hiddenLayers;  // 은닉층 수
    private Integer neurons;       // 뉴런 수
    private Integer epochs;        // 학습 횟수
    private Integer batchSize;     // 배치 크기
    private Double learningRate;   // 학습률 (소수점 포함)
    private String optimizer;      // 최적화 도구 (Adam, SGD 등)

    // 3. 분석 결과
    private Double lossVal;        // 손실값
    private String resultJson;     // 분석 결과 상세 (JSON 문자열)
    private String graphUrl;       // 생성된 그래프 이미지 경로 (필요 시)
}