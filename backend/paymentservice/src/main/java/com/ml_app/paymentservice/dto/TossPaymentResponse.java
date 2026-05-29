package com.ml_app.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossPaymentResponse {
    private String paymentKey;
    private String orderId;
    private String orderName;
    private String status;     // DONE, ABORTED, EXPIRED 등
    private Long   totalAmount;
    private String method;
    private String approvedAt; // ISO 8601
}
