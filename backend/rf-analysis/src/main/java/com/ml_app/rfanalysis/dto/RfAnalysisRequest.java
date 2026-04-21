package com.ml_app.rfanalysis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString // 로그 찍어보기 편하게 추가
public class RfAnalysisRequest {

    @JsonProperty("inputDataNm")
    private String inputDataNm;

    @JsonProperty("nEstimators") // 💡 JSON에서 "nEstimators"라는 이름으로 오면 이 필드에 넣어라!
    private Integer nEstimators;

    @JsonProperty("maxDepth")
    private Integer maxDepth;

    @JsonProperty("minSamplesSplit")
    private Integer minSamplesSplit;

    private String criterion;
    private Double accuracy;
    private String resultJson;
    private String graphUrl;
}