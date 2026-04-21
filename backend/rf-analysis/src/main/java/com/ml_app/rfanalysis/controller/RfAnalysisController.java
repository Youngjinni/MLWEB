package com.ml_app.rfanalysis.controller;

import lombok.RequiredArgsConstructor;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import com.ml_app.rfanalysis.service.RfAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RfAnalysisController {

    private final RfAnalysisService rfAnalysisService;

    @PostMapping("/rf")
    public ResponseEntity<String> saveRf(@RequestBody RfAnalysisRequest request) {
        // 현재 로그인한 유저 ID (실제로는 토큰에서 추출)
        Long currentUserId = 1L;

        rfAnalysisService.saveRfResult(request, currentUserId);

        return ResponseEntity.ok("Random Forest 분석 결과 저장 성공");
    }
}