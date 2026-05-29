package com.ml_app.paymentservice.dto;

import lombok.Getter;

@Getter
public class BillingIssueRequest {
    private String authKey;
    private String customerKey;
}
