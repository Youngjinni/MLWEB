package com.ml_app.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    // 보안을 위해 키는 32바이트 이상으로 길게 작성하세요!
    private final String SECRET_KEY = "your_very_secret_key_should_be_long_enough_and_secure_2026";
    private final long EXPIRATION_TIME = 86400000; // 24시간

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

    // 매개변수를 Long userId로 수정 (DB의 PK값)
    public String createToken(Long userId, String role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("auth", role) // 👈 "auth"라는 이름으로 권한(예: ROLE_USER)을 넣어줍니다.
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        // 최신 버전(0.12.x) 문법 기준
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject()); // Subject에서 ID 추출 후 Long 변환
    }
}