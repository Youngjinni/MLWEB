package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "file:../.env")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("영진님의 ML_USER 엔티티 필드명에 맞춘 실제 DB 저장 테스트")
    void userEntityFinalTest() {
        // 1. Given: 엔티티 구조에 맞는 데이터 준비
        Long testUserId = 10001L;
        String testEmail = "test@mlweb.com";
        String testLoginId = "youngjin77";
        String testNickname = "영진봇";
        String testPassword = "encrypted_password_here";

        UserEntity user = UserEntity.builder()
                .userId(testUserId)  // PK (Long)
                .email(testEmail)    // 이메일
                .id(testLoginId)     // 로그인 아이디 (String)
                .nm(testNickname)    // 닉네임 (String)
                .pw(testPassword)    // 비밀번호 (String) - 여기서 에러 났던 부분!
                .subscYn(0)          // 미구독 상태
                .build();

        // 2. When: 실제 DB(Oracle)에 저장
        UserEntity savedUser = userRepository.save(user);

        // 3. Then: 저장된 데이터가 DB에 있는지 확인
        Optional<UserEntity> foundUser = userRepository.findById(savedUser.getUserId());

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getId()).isEqualTo(testLoginId);
        assertThat(foundUser.get().getNm()).isEqualTo(testNickname);

        System.out.println("=====================================");
        System.out.println("🎉 [성공] .env를 통해 Oracle DB에 접속했습니다.");
        System.out.println("저장된 사용자 ID(PK): " + savedUser.getUserId());
        System.out.println("로그인 아이디: " + savedUser.getId());
        System.out.println("=====================================");
    }
}