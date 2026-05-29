package com.ml_app.commonmodule.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * community / lstm / rf 서비스에서 Access Token 검증에 사용하는 공통 유틸.
 * Spring Bean이 아니므로 new JwtUtil(secret)으로 직접 생성.
 */
public class JwtUtil {

    private final SecretKey key;

    public JwtUtil(String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Authorization 헤더("Bearer <token>")에서 userId를 추출.
     * - Access Token인지 확인 (Refresh Token으로 API 직접 호출 차단)
     * - 만료 여부 확인
     */
    public Long getUserIdFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 없거나 형식이 잘못되었습니다.");
        }
        String token = authorizationHeader.substring(7);

        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new IllegalArgumentException("Access Token이 만료되었습니다.");
        }

        // Refresh Token으로 API를 직접 호출하는 시도 차단
        String tokenType = (String) claims.get("type");
        if (!"access".equals(tokenType)) {
            throw new IllegalArgumentException("Access Token만 사용 가능합니다.");
        }

        return Long.parseLong(claims.getSubject());
    }
}
