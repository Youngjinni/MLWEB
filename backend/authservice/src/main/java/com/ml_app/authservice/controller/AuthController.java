package com.ml_app.authservice.controller;

import com.ml_app.authservice.dto.LoginRequest;
import com.ml_app.authservice.dto.SignupRequest;
import com.ml_app.authservice.dto.TokenResponse;
import com.ml_app.authservice.dto.UserResponseDto;
import com.ml_app.authservice.service.AuthService;
import com.ml_app.authservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil     jwtUtil;

    /** 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    /**
     * 로그인 → AccessToken + RefreshToken 반환
     * 프론트: accessToken은 메모리(or 짧은 localStorage), refreshToken은 HttpOnly Cookie 권장
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        TokenResponse tokens = authService.login(request.getId(), request.getPw());
        return ResponseEntity.ok(tokens);
    }

    /**
     * Access Token 재발급.
     * 요청 바디: { "refreshToken": "..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TokenResponse tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok(tokens);
    }

    /**
     * 로그아웃: Redis에서 Refresh Token 삭제.
     * Access Token의 userId로 처리.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String authHeader) {
        String jwt    = authHeader.substring(7);
        Long   userId = jwtUtil.getUserIdFromToken(jwt);
        authService.logout(userId);
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    /** 내 정보 조회 (pw 제외) */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.getUserIdFromToken(authHeader.substring(7));
        return ResponseEntity.ok(authService.getMyInfo(userId));
    }
}
