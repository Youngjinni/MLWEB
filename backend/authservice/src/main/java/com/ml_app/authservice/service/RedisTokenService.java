package com.ml_app.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Redis Refresh Token 관리 서비스.
 *
 * Key 구조: "refresh:{userId}" → refreshToken 문자열
 *
 * Refresh Token Rotation:
 *   - 재발급 시 기존 토큰 삭제 후 새 토큰 저장
 *   - Redis TTL이 만료되면 자동 삭제 (별도 스케줄러 불필요)
 */
@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private static final String PREFIX = "refresh:";

    private final RedisTemplate<String, String> redisTemplate;

    /** Refresh Token 저장 (TTL = refreshTokenExpiry ms) */
    public void saveRefreshToken(Long userId, String refreshToken, long expiryMs) {
        String key = PREFIX + userId;
        redisTemplate.opsForValue().set(key, refreshToken, expiryMs, TimeUnit.MILLISECONDS);
    }

    /** Redis에 저장된 Refresh Token 조회 */
    public String getRefreshToken(Long userId) {
        return redisTemplate.opsForValue().get(PREFIX + userId);
    }

    /**
     * Refresh Token 유효성 검증.
     * Redis에 저장된 값과 클라이언트가 보낸 값이 일치해야 함.
     * (Rotation 후 이전 토큰 재사용 시도 탐지)
     */
    public boolean isValid(Long userId, String refreshToken) {
        String stored = getRefreshToken(userId);
        return stored != null && stored.equals(refreshToken);
    }

    /** 로그아웃 / 강제 만료 시 삭제 */
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete(PREFIX + userId);
    }
}
