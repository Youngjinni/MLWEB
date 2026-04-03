package com.ml_app.communityservice.service;

import com.ml_app.commonmodule.entity.PostEntity;
import com.ml_app.commonmodule.repository.PostRepository;
import com.ml_app.communityservice.dto.PostDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

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
}
