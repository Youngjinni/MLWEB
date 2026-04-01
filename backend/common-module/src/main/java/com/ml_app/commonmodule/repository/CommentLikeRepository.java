package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.CommentLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLikeEntity, CommentLikeEntity.CommentLikeId> {
    // 특정 유저가 특정 댓글에 좋아요를 눌렀는지 확인
    Optional<CommentLikeEntity> findByUserIdAndCmetId(Long userId, Long cmetId);
}
