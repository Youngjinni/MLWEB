package com.ml_app.lstmanalysis.controller;

import com.ml_app.commonmodule.util.JwtUtil;
import com.ml_app.lstmanalysis.dto.LstmAnalysisRequest;
import com.ml_app.lstmanalysis.service.LstmAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class LstmAnalysisController {

    private final LstmAnalysisService lstmAnalysisService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private JwtUtil jwtUtil() {
        return new JwtUtil(jwtSecret);
    }

    /**
     * 수정: @CrossOrigin 제거 (게이트웨이에서 CORS 처리),
     *       하드코딩된 userId=1L → JWT에서 실제 userId 추출
     */
    @PostMapping("/lstm")
    public ResponseEntity<String> saveLstm(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody LstmAnalysisRequest request) {
        Long currentUserId = jwtUtil().getUserIdFromHeader(authHeader);
        lstmAnalysisService.saveAnalysisResult(request, currentUserId);
        return ResponseEntity.ok("LSTM 분석 결과 저장 성공");
    }
}
