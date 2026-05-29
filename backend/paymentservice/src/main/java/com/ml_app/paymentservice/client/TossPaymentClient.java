package com.ml_app.paymentservice.client;

import com.ml_app.paymentservice.dto.TossBillingKeyResponse;
import com.ml_app.paymentservice.dto.TossPaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Toss Payments REST API 클라이언트.
 * Authorization: Basic Base64({secretKey}:)
 */
@Component
@RequiredArgsConstructor
public class TossPaymentClient {

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.api-url}")
    private String apiUrl;

    @Value("${subscription.amount}")
    private Long amount;

    @Value("${subscription.order-name}")
    private String orderName;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders authHeaders() {
        String encoded = Base64.getEncoder()
            .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * 빌링키 발급
     * authKey + customerKey → billingKey (카드 재입력 없이 결제 가능)
     */
    public TossBillingKeyResponse issueBillingKey(String authKey, String customerKey) {
        Map<String, String> body = new HashMap<>();
        body.put("authKey", authKey);
        body.put("customerKey", customerKey);

        ResponseEntity<TossBillingKeyResponse> response = restTemplate.exchange(
            apiUrl + "/billing/authorizations/issue",
            HttpMethod.POST,
            new HttpEntity<>(body, authHeaders()),
            TossBillingKeyResponse.class
        );
        return response.getBody();
    }

    /**
     * 빌링키로 자동결제 실행
     * 로그인 없이 서버에서 직접 호출 (월 1일 스케줄러용)
     */
    public TossPaymentResponse chargeWithBillingKey(String billingKey, String customerKey,
                                                     String orderId, Long chargeAmount) {
        Map<String, Object> body = new HashMap<>();
        body.put("customerKey", customerKey);
        body.put("amount",      chargeAmount != null ? chargeAmount : amount);
        body.put("orderId",     orderId);
        body.put("orderName",   orderName);

        ResponseEntity<TossPaymentResponse> response = restTemplate.exchange(
            apiUrl + "/billing/" + billingKey,
            HttpMethod.POST,
            new HttpEntity<>(body, authHeaders()),
            TossPaymentResponse.class
        );
        return response.getBody();
    }
}
