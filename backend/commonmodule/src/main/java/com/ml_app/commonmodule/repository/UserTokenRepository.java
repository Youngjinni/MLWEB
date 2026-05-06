package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.UserTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTokenRepository extends JpaRepository<UserTokenEntity, Long> {

    // 리프레시 토큰 값으로 데이터 찾기 (검증용)
    Optional<UserTokenEntity> findByRefreshToken(String refreshToken);

    // 특정 유저의 토큰 찾기 (로그아웃 처리 시 삭제용)
    Optional<UserTokenEntity> findByUserId(Long userId);

    // 특정 유저의 기존 토큰 삭제 (새로 로그인할 때 기존꺼 지우기)
    void deleteByUserId(Long userId);
}