package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.PostLikeEntity;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLikeEntity, PostLikeEntity.PostLikeId> {
    // 특정 유저가 특정 글에 좋아요를 눌렀는지 확인
    Optional<PostLikeEntity> findByUserIdAndPostId(Long userId, Long postId);
}
