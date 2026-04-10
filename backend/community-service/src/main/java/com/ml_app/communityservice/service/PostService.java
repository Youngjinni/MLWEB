package com.ml_app.communityservice.service;

import com.ml_app.commonmodule.entity.PostEntity;
import com.ml_app.commonmodule.entity.CommentEntity;
import com.ml_app.commonmodule.repository.PostRepository;
import com.ml_app.commonmodule.repository.CommentRepository;
import com.ml_app.communityservice.dto.PostDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public PostEntity createPost(PostDto postDto, Long currentUserId) {
        // 엔티티의 @Builder를 활용합니다.
        // @Builder.Default 덕분에 viewCnt, likeCnt 등은 선언하지 않아도 0L로 들어갑니다.
        PostEntity post = PostEntity.builder()
                .postId(System.currentTimeMillis()) // @GeneratedValue가 없으므로 임시 ID 생성 (추후 시퀀스 권장)
                .userId(currentUserId)              // 필수값인 작성자 ID 설정
                .postNm(postDto.getPostNm())
                .cont(postDto.getCont())
                .imgUrl(postDto.getImgUrl())
                .build();

        return postRepository.save(post);
    }
    // 기존 좋아요에 +1
    @Transactional
    public Long increasePostLike(Long postId) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 기존 좋아요 수에 +1 (null 체크 포함)
        Long currentLike = post.getLikeCnt() == null ? 0L : post.getLikeCnt();
        post.updateLikeCount(true); // 만약 PostEntity에 이 메서드가 없다면 아래처럼 직접 넣으세요.
        // post.setLikeCnt(currentLike + 1);

        return post.getLikeCnt();
    }

    /**
     * 댓글 저장
     */
    @Transactional
    public CommentEntity addComment(Long postId, Long userId, String content) {
        CommentEntity comment = CommentEntity.builder()
                .cmetId(System.currentTimeMillis()) // 임시 ID
                .postId(postId)
                .userId(userId)
                .cont(content)
                .likeCnt(0L)
                .build();

        return commentRepository.save(comment);
    }

    /**
     * 특정 게시글의 모든 댓글 조회
     */
    public List<CommentEntity> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCrtrDtAsc(postId);
    }
}
