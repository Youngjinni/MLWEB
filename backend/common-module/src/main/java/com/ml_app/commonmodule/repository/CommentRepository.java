package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    // 1. 특정 게시글에 달린 모든 댓글을 오래된 순(작성순)으로 조회
    List<CommentEntity> findByPostIdOrderByCrtrDtAsc(Long postId);

    // 2. 특정 유저가 쓴 댓글 모아보기 (마이페이지용)
    List<CommentEntity> findByUserIdOrderByCrtrDtDesc(Long userId);

    // 3. 특정 게시글의 댓글 개수 확인
    long countByPostId(Long postId);
}