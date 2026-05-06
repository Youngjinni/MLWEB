package com.ml_app.communityservice.controller;


import com.ml_app.commonmodule.entity.PostEntity;
import com.ml_app.commonmodule.repository.PostRepository;
import com.ml_app.communityservice.dto.PostDto;
import com.ml_app.communityservice.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class PostController {
    private final PostRepository postRepository;
    private final PostService postService;

    // 1. 목록 조회
    @GetMapping("/posts")
    public List<PostEntity> getPost(){
        return postRepository.findAllByOrderByCrtrDtDesc(Pageable.ofSize(20)).getContent();
    }

    // 2. 상세 조회
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostEntity> getPostById(@PathVariable("id") Long id){
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. 좋아요 클릭 (추가) ✅
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Long> likePost(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postService.increasePostLike(id));
    }

    // 4. 댓글 목록 조회 (추가) ✅
    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<com.ml_app.commonmodule.entity.CommentEntity>> getComments(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postService.getComments(id));
    }

    // 5. 댓글 등록 (추가) ✅
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<com.ml_app.commonmodule.entity.CommentEntity> addComment(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> request) {

        // 실제 운영 시에는 토큰에서 userId를 추출해야 함
        Long mockUserId = 1L;
        String content = request.get("cont");
        return ResponseEntity.ok(postService.addComment(id, mockUserId, content));
    }

    // 6. 게시글 저장 (경로를 /posts로 수정)
    @PostMapping("/posts") // 기존 "/posts/save"에서 "/save" 삭제
    public ResponseEntity<PostEntity> savePost(@RequestBody PostDto postDto) {
        Long mockUserId = 1L;
        PostEntity savedPost = postService.createPost(postDto, mockUserId);
        return ResponseEntity.ok(savedPost);
    }
}
