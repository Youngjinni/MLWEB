package com.ml_app.commonmodule.repository;

import com.ml_app.commonmodule.entity.PostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Long> {

    // 1. 최신순으로 게시글 목록 가져오기 (페이징 처리)
    Page<PostEntity> findAllByOrderByCrtrDtDesc(Pageable pageable);

    // 2. 특정 유저가 쓴 글 모아보기
    List<PostEntity> findByUserIdOrderByCrtrDtDesc(Long userId);

    // 3. 제목으로 검색하기
    Page<PostEntity> findByPostNmContaining(String keyword, Pageable pageable);
}