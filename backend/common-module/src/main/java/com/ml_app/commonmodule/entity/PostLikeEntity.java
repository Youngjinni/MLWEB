package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "ML_COMM_POST_LIKE")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@IdClass(PostLikeEntity.PostLikeId.class) // 복합키 설정을 위한 내부 클래스 참조
public class PostLikeEntity {

    @Id
    @Column(name = "USER_ID")
    private Long userId;

    @Id
    @Column(name = "POST_ID")
    private Long postId;

    @Builder.Default
    @Column(name = "LIKE_YN")
    private Integer likeYn = 1; // 1: 좋아요, 0: 취소

    // --- 복합키를 위한 식별자 클래스 ---
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class PostLikeId implements Serializable {
        private Long userId;
        private Long postId;
    }

    // 상태 변경 메서드
    public void toggleLike(boolean status) {
        this.likeYn = status ? 1 : 0;
    }
}