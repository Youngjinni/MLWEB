package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.LstmEntity;
import com.ml_app.commonmodule.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsById(String id);
    Optional<UserEntity> findUserById(String id);
    Optional<UserEntity> findByEmail(String email);
}