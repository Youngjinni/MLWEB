package com.ml_app.communityservice.controller;

import com.ml_app.commonmodule.entity.CommentEntity;
import com.ml_app.commonmodule.entity.PostEntity;
import com.ml_app.commonmodule.repository.PostRepository;
import com.ml_app.commonmodule.util.JwtUtil;
import com.ml_app.communityservice.dto.PostDto;
import com.ml_app.communityservice.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final PostService postService;

    // 수정: JWT 시크릿을 환경변수에서 받아 JwtUtil 생성 (Bean 대신 직접 생성 - 서비스간 의존성 최소화)
    @Value("${jwt.secret}")
    private String jwtSecret;

    private JwtUtil jwtUtil() {
        return new JwtUtil(jwtSecret);
    }

    // 1. 목록 조회 (인증 불필요)
    @GetMapping("/posts")
    public List<PostEntity> getPosts() {
        return postRepository.findAllByOrderByCrtrDtDesc(Pageable.ofSize(20)).getContent();
    }

    // 2. 상세 조회 (인증 불필요)
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostEntity> getPostById(@PathVariable("id") Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. 좋아요 클릭 (인증 필요)
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Long> likePost(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String authHeader) {
        jwtUtil().getUserIdFromHeader(authHeader); // 인증 확인 (userId는 현재 사용 안 함)
        return ResponseEntity.ok(postService.increasePostLike(id));
    }

    // 4. 댓글 목록 조회 (인증 불필요)
    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<CommentEntity>> getComments(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postService.getComments(id));
    }

    // 5. 댓글 등록 (인증 필요)
    //    수정: 하드코딩된 mockUserId=1L → JWT에서 실제 userId 추출
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommentEntity> addComment(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        String content = request.get("cont");
        return ResponseEntity.ok(postService.addComment(id, userId, content));
    }

    // 6. 게시글 등록 (인증 필요)
    //    수정: 하드코딩된 mockUserId=1L → JWT에서 실제 userId 추출
    @PostMapping("/posts")
    public ResponseEntity<PostEntity> savePost(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PostDto postDto) {
        Long userId = jwtUtil().getUserIdFromHeader(authHeader);
        PostEntity savedPost = postService.createPost(postDto, userId);
        return ResponseEntity.ok(savedPost);
    }
}
