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
    @GetMapping("/posts")
    public List<PostEntity> getPost(){
        return postRepository.findAllByOrderByCrtrDtDesc(Pageable.ofSize(20)).getContent();
    }
    @GetMapping("/Posts/{id}")
    public ResponseEntity<PostEntity> getPostById(@PathVariable Long id){
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/Posts")
    public PostEntity createPost(@RequestBody PostEntity post) {
    // 실제 운영 시에는 SecurityContextHolder에서 현재 로그인한 유저 ID를 가져와 세팅해야 합니다.
        return postRepository.save(post);
    }
    @PostMapping
    public ResponseEntity<PostEntity> savePost(@RequestBody PostDto postDto) {
        // 임시로 userId를 1L로 설정 (추후 시큐리티 토큰에서 추출)
        Long mockUserId = 1L;
        PostEntity savedPost = postService.createPost(postDto, mockUserId);
        return ResponseEntity.ok(savedPost);
    }
}
