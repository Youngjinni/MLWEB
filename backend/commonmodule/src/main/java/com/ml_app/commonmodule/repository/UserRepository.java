package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.id = :loginId")
    long countByLoginId(@Param("loginId") String loginId);

    @Query("SELECT u FROM UserEntity u WHERE u.id = :loginId")
    Optional<UserEntity> findUserById(@Param("loginId") String loginId);

    Optional<UserEntity> findByEmail(String email);

    /** BillingScheduler: 구독 중인 전체 유저 조회 */
    List<UserEntity> findBySubscYn(Integer subscYn);
}
