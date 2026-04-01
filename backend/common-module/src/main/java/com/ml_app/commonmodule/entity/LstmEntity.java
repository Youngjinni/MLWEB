package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_MODEL_LSTM")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LstmEntity {

    @Id
    @Column(name = "ANAL_ID")
    private Long analId; // 분석 고유 ID

    @Column(name = "USER_ID", nullable = false)
    private Long userId; // 분석을 수행한 유저 ID (외래키 역할)

    @Column(name = "INPUT_DATA_NM")
    private String inputDataNm;

    @Builder.Default
    @Column(name = "WINDOW_SIZE")
    private Integer windowSize = 10;

    @Builder.Default
    @Column(name = "HIDDEN_LAYERS")
    private Integer hiddenLayers = 1;

    @Builder.Default
    @Column(name = "NEURONS")
    private Integer neurons = 64;

    @Builder.Default
    @Column(name = "EPOCHS")
    private Integer epochs = 100;

    @Builder.Default
    @Column(name = "BATCH_SIZE")
    private Integer batchSize = 32;

    @Builder.Default
    @Column(name = "LEARNING_RATE")
    private Double learningRate = 0.001;

    @Builder.Default
    @Column(name = "OPTIMIZER")
    private String optimizer = "Adam";

    @Builder.Default
    @Column(name = "LOSS_VAL")
    private Double lossVal = 0.0;

    @Lob // 중요: 긴 JSON 데이터를 위해 CLOB 매핑
    @Column(name = "RESULT_JSON")
    private String resultJson;

    @Column(name = "GRAPH_URL")
    private String graphUrl;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;
}