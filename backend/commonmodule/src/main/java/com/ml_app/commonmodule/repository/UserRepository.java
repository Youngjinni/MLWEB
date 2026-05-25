package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * 수정: existsById(String) → countByLoginId
     * 기존 existsById(String)는 JpaRepository의 existsById(Long) 와 이름이 겹쳐
     * Spring Data JPA가 혼동할 수 있으므로 @Query로 명시적으로 처리.
     */
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.id = :loginId")
    long countByLoginId(@Param("loginId") String loginId);

    /** 로그인 ID(String)로 사용자 조회 */
    @Query("SELECT u FROM UserEntity u WHERE u.id = :loginId")
    Optional<UserEntity> findUserById(@Param("loginId") String loginId);

    /** 이메일로 사용자 조회 */
    Optional<UserEntity> findByEmail(String email);
}
