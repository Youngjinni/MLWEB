package com.ml_app.authservice.service;

import com.ml_app.authservice.dto.SignupRequest;
import com.ml_app.authservice.dto.TokenResponse;
import com.ml_app.authservice.dto.UserResponseDto;
import com.ml_app.authservice.util.JwtUtil;
import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository     userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil            jwtUtil;
    private final RedisTokenService  redisTokenService;

    @Value("${jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.countByLoginId(request.getId()) > 0) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }
        UserEntity user = UserEntity.builder()
                .userId(System.currentTimeMillis())
                .id(request.getId())
                .email(request.getEmail())
                .nm(request.getNm())
                .pw(passwordEncoder.encode(request.getPw()))
                .subscYn(0)
                .build();
        userRepository.save(user);
    }

    /**
     * 로그인:
     *  1. 자격증명 검증
     *  2. Access Token + Refresh Token 발급
     *  3. Refresh Token을 Redis에 저장 (TTL 7일)
     *  4. TokenResponse 반환
     */
    @Transactional
    public TokenResponse login(String id, String pw) {
        UserEntity user = userRepository.findUserById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 아이디입니다."));
        if (!passwordEncoder.matches(pw, user.getPw())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken  = jwtUtil.createAccessToken(user.getUserId(), "ROLE_USER");
        String refreshToken = jwtUtil.createRefreshToken(user.getUserId());

        // 기존 Refresh Token 덮어쓰기 (재로그인 시 이전 토큰 무효화)
        redisTokenService.saveRefreshToken(user.getUserId(), refreshToken, refreshTokenExpiry);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(accessTokenExpiry)
                .refreshTokenExpiresIn(refreshTokenExpiry)
                .build();
    }

    /**
     * 토큰 재발급 (Refresh Token Rotation):
     *  1. Refresh Token 서명 검증
     *  2. Redis에 저장된 값과 비교 (탈취 후 재사용 감지)
     *  3. Access Token + 새 Refresh Token 발급
     *  4. Redis 갱신
     */
    @Transactional
    public TokenResponse refresh(String refreshToken) {
        // 서명 / 만료 검증
        if (jwtUtil.isExpired(refreshToken)) {
            throw new RuntimeException("Refresh Token이 만료되었습니다. 다시 로그인해주세요.");
        }
        if (!"refresh".equals(jwtUtil.getTokenType(refreshToken))) {
            throw new RuntimeException("잘못된 토큰 타입입니다.");
        }

        Long userId = jwtUtil.getUserIdFromToken(refreshToken);

        // Redis 값 비교 - 재사용(replay attack) 감지
        if (!redisTokenService.isValid(userId, refreshToken)) {
            // 탈취 의심: Redis에 저장된 토큰도 삭제하여 해당 계정 강제 로그아웃
            redisTokenService.deleteRefreshToken(userId);
            throw new RuntimeException("유효하지 않은 Refresh Token입니다. 보안을 위해 재로그인이 필요합니다.");
        }

        // Rotation: 새 토큰 쌍 발급
        String newAccessToken  = jwtUtil.createAccessToken(userId, "ROLE_USER");
        String newRefreshToken = jwtUtil.createRefreshToken(userId);

        redisTokenService.saveRefreshToken(userId, newRefreshToken, refreshTokenExpiry);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .accessTokenExpiresIn(accessTokenExpiry)
                .refreshTokenExpiresIn(refreshTokenExpiry)
                .build();
    }

    /**
     * 로그아웃: Redis에서 Refresh Token 삭제
     * (Access Token은 stateless라 만료 전까지 유효하지만 TTL이 30분이므로 실용적으로 허용)
     */
    @Transactional
    public void logout(Long userId) {
        redisTokenService.deleteRefreshToken(userId);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getMyInfo(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return UserResponseDto.from(user);
    }
}
