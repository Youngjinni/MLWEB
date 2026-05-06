package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_MODEL_RF")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RfEntity {

    @Id
    @Column(name = "ANAL_ID", precision = 19)
    private Long analId;

    @Column(name = "USER_ID", nullable = false, precision = 19)
    private Long userId;

    @Column(name = "INPUT_DATA_NM", length = 100)
    private String inputDataNm;

    @Builder.Default
    @Column(name = "N_ESTIMATORS")
    private Integer nEstimators = 100; // 결정 트리 개수

    @Column(name = "MAX_DEPTH")
    private Integer maxDepth; // 트리의 최대 깊이

    @Builder.Default
    @Column(name = "MIN_SAMPLES_SPLIT")
    private Integer minSamplesSplit = 2;

    @Builder.Default
    @Column(name = "CRITERION")
    private String criterion = "gini"; // 불순도 지표

    @Builder.Default
    @Column(name = "ACCURACY")
    private Double accuracy = 0.0; // 모델 정확도

    @Lob
    @Column(name = "RESULT_JSON")
    private String resultJson;

    @Column(name = "GRAPH_URL")
    private String graphUrl;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;
}