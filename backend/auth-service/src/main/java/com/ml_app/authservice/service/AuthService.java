package com.ml_app.authservice.service;

import com.ml_app.commonmodule.entity.UserEntity;
import com.ml_app.commonmodule.repository.UserRepository;
import com.ml_app.authservice.dto.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequest request) {
        // 1. 아이디 중복 체크 (선택 사항)
        if (userRepository.existsById(request.getId())) {
            // 메서드 이름이 중복되어 헷갈린다면 레포지토리 메서드명을
            // existsByLoginId(String id) 등으로 바꿔서 쓰셔도 됩니다.
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPw());

        // 3. Entity 변환 및 저장
        UserEntity user = UserEntity.builder()
                .userId(System.currentTimeMillis()) // 임시 ID 생성 (시퀀스나 오토인크리먼트 전략에 따라 수정 가능)
                .id(request.getId())
                .email(request.getEmail())
                .nm(request.getNm())
                .pw(encodedPassword) // 암호화된 비번 저장
                .subscYn(0) // 초기 구독 상태: 미구독
                .build();

        userRepository.save(user);
    }
    private final com.ml_app.authservice.util.JwtUtil jwtUtil; // JwtUtil 주입

    @Transactional(readOnly = true)
    public String login(String id, String pw) {
        // 레포지토리에서 만든 이름과 똑같이 맞춰주세요 (예: findUserById)
        UserEntity user = userRepository.findUserById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 아이디입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(pw, user.getPw())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 토큰 생성 및 반환
        return jwtUtil.createToken(user.getUserId());
    }

    @Transactional(readOnly = true)
    public UserEntity getMyInfo(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
