package com.ml_app.rfanalysis.controller;

import com.ml_app.commonmodule.entity.RfEntity;
import com.ml_app.commonmodule.util.JwtUtil;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import com.ml_app.rfanalysis.service.RfAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class RfAnalysisController {

    private final RfAnalysisService rfAnalysisService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private JwtUtil jwtUtil() {
        return new JwtUtil(jwtSecret);
    }

    /**
     * 수정: @CrossOrigin 제거, Authentication 파라미터 제거,
     *       Authorization 헤더에서 userId 직접 추출 후 saveRfResult 호출.
     *       기존 saveRfResultWithUsername(email 기반)은 Spring Security가 없으면 동작하지 않아
     *       userId 기반의 saveRfResult로 교체.
     */
    @PostMapping("/rf")
    public ResponseEntity<String> saveRf(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody RfAnalysisRequest request) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        rfAnalysisService.saveRfResult(request, userId);
        return ResponseEntity.ok("Random Forest 분석 결과 저장 성공");
    }

    @GetMapping("/rf/history")
    public ResponseEntity<List<RfEntity>> getUserHistory(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        List<RfEntity> history = rfAnalysisService.getHistoryByUserId(userId);
        return ResponseEntity.ok(history);
    }
}
