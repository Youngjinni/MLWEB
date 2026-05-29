package com.ml_app.paymentservice.controller;

import com.ml_app.commonmodule.entity.PaymentEntity;
import com.ml_app.commonmodule.util.JwtUtil;
import com.ml_app.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private JwtUtil jwtUtil() { return new JwtUtil(jwtSecret); }

    /**
     * 빌링키 발급 + 첫 달 결제
     * 프론트 Toss SDK → authKey, customerKey 서버 전달
     */
    @PostMapping("/billing/issue")
    public ResponseEntity<String> issueBilling(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        paymentService.issueBillingKeyAndCharge(
            userId,
            body.get("authKey"),
            body.get("customerKey")
        );
        return ResponseEntity.ok("구독이 시작되었습니다.");
    }

    /** 구독 취소 */
    @PostMapping("/cancel")
    public ResponseEntity<String> cancel(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        paymentService.cancelSubscription(userId);
        return ResponseEntity.ok("구독이 취소되었습니다.");
    }

    /** 결제 이력 조회 */
    @GetMapping("/history")
    public ResponseEntity<List<PaymentEntity>> history(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
    }
}
