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

    private final UserRepository        userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final RedisTokenService     redisTokenService;

    @Value("${jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.countByLoginId(request.getId()) > 0)
            throw new RuntimeException("이미 존재하는 아이디입니다.");

        userRepository.save(UserEntity.builder()
                .userId(System.currentTimeMillis())
                .id(request.getId())
                .email(request.getEmail())
                .nm(request.getNm())
                .pw(passwordEncoder.encode(request.getPw()))
                .subscYn(0)
                .build());
    }

    @Transactional
    public TokenResponse login(String id, String pw) {
        UserEntity user = userRepository.findUserById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 아이디입니다."));
        if (!passwordEncoder.matches(pw, user.getPw()))
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");

        // subscYn을 토큰에 포함 → mlservice가 DB 조회 없이 구독 여부 판단
        String accessToken  = jwtUtil.createAccessToken(user.getUserId(), "ROLE_USER", user.getSubscYn());
        String refreshToken = jwtUtil.createRefreshToken(user.getUserId());
        redisTokenService.saveRefreshToken(user.getUserId(), refreshToken, refreshTokenExpiry);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(accessTokenExpiry)
                .refreshTokenExpiresIn(refreshTokenExpiry)
                .build();
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (jwtUtil.isExpired(refreshToken))
            throw new RuntimeException("Refresh Token이 만료되었습니다. 다시 로그인해주세요.");
        if (!"refresh".equals(jwtUtil.getTokenType(refreshToken)))
            throw new RuntimeException("잘못된 토큰 타입입니다.");

        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        if (!redisTokenService.isValid(userId, refreshToken)) {
            redisTokenService.deleteRefreshToken(userId);
            throw new RuntimeException("유효하지 않은 Refresh Token입니다. 재로그인이 필요합니다.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 재발급 시에도 최신 subscYn 반영
        String newAccessToken  = jwtUtil.createAccessToken(userId, "ROLE_USER", user.getSubscYn());
        String newRefreshToken = jwtUtil.createRefreshToken(userId);
        redisTokenService.saveRefreshToken(userId, newRefreshToken, refreshTokenExpiry);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .accessTokenExpiresIn(accessTokenExpiry)
                .refreshTokenExpiresIn(refreshTokenExpiry)
                .build();
    }

    @Transactional
    public void logout(Long userId) {
        redisTokenService.deleteRefreshToken(userId);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getMyInfo(Long userId) {
        return UserResponseDto.from(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다.")));
    }
}
