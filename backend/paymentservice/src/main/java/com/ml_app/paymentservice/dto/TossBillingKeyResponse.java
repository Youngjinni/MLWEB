package com.ml_app.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossBillingKeyResponse {
    private String billingKey;
    private String customerKey;
    private String method;         // 결제 수단 (카드 등)
    private String cardNumber;
    private String cardCompany;
}
