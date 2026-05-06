package com.ml_app.rfanalysis.controller;

import lombok.RequiredArgsConstructor;
import com.ml_app.rfanalysis.dto.RfAnalysisRequest;
import com.ml_app.rfanalysis.service.RfAnalysisService;
import com.ml_app.commonmodule.entity.RfEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails; // 기본 클래스 활용
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RfAnalysisController {

    private final RfAnalysisService rfAnalysisService;

    @PostMapping("/rf")
    public ResponseEntity<String> saveRf(
            @RequestBody RfAnalysisRequest request,
            Authentication authentication) { // 💡 PrincipalDetails 대신 이걸로 변경

        if (authentication == null) {
            return ResponseEntity.status(401).body("인증 정보가 없습니다.");
        }

        // authentication.getName()은 로그인한 유저의 ID(이메일 등)를 바로 가져옵니다.
        String username = authentication.getName();

        // 기존 서비스의 username 처리 메서드 호출
        rfAnalysisService.saveRfResultWithUsername(request, username);

        return ResponseEntity.ok("Random Forest 분석 결과 저장 성공");
    }

    @GetMapping("/history")
    public ResponseEntity<List<RfEntity>> getUserHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).build();

        // [기존 활용] username으로 히스토리 조회
        List<RfEntity> history = rfAnalysisService.getHistoryByUsername(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }
}