package com.ml_app.authservice.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 로그인 / 토큰 재발급 응답 DTO.
 * accessToken: 모든 API 호출에 사용 (Authorization 헤더)
 * refreshToken: 만료 시 재발급 요청에만 사용
 */
@Getter
@Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private long   accessTokenExpiresIn;  // ms
    private long   refreshTokenExpiresIn; // ms
}
