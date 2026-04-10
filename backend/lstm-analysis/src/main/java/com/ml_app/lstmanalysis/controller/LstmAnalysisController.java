package com.ml_app.lstmanalysis.controller;

import lombok.RequiredArgsConstructor;
import com.ml_app.lstmanalysis.dto.LstmAnalysisRequest;
import com.ml_app.lstmanalysis.service.LstmAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LstmAnalysisController {

    private final LstmAnalysisService lstmAnalysisService;

    @PostMapping("/lstm")
    public ResponseEntity<String> saveLstm(@RequestBody LstmAnalysisRequest request) {
        // 엔티티의 userId가 Long 타입이므로 1L과 같이 전달
        // 실제로는 토큰에서 추출한 유저 PK 값을 넣어야 합니다.
        Long currentUserId = 1L;

        lstmAnalysisService.saveAnalysisResult(request, currentUserId);

        return ResponseEntity.ok("LSTM 분석 결과 저장 성공 (분석ID: " + System.currentTimeMillis() + ")");
    }
}