package com.ml_app.authservice.controller;

import com.ml_app.authservice.dto.LoginRequest;
import com.ml_app.authservice.dto.SignupRequest;
import com.ml_app.authservice.service.AuthService;
import com.ml_app.authservice.util.JwtUtil;
import com.ml_app.commonmodule.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }
    // AuthController.java 에 추가
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getId(), request.getPw());
        return ResponseEntity.ok(token); // 성공 시 JWT 토큰 문자열 반환
    }

    @GetMapping("/me")
    public ResponseEntity<UserEntity> getMyInfo(@RequestHeader("Authorization") String token) {
        // 1. 토큰에서 사용자 ID 추출 (JwtUtil 사용)
        String jwt = token.substring(7); // "Bearer " 제거


        Long userId = jwtUtil.getUserIdFromToken(jwt);

        // 2. 서비스에서 사용자 정보 조회
        UserEntity user = authService.getMyInfo(userId);
        return ResponseEntity.ok(user);
    }
}
