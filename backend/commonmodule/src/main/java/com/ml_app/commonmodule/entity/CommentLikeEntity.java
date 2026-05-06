package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "ML_COMM_CMET_LIKE")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@IdClass(CommentLikeEntity.CommentLikeId.class)
public class CommentLikeEntity {

    @Id
    @Column(name = "USER_ID")
    private Long userId;

    @Id
    @Column(name = "CMET_ID")
    private Long cmetId;

    @Builder.Default
    @Column(name = "LIKE_YN")
    private Integer likeYn = 1;

    // --- 복합키를 위한 식별자 클래스 ---
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class CommentLikeId implements Serializable {
        private Long userId;
        private Long cmetId;
    }

    public void toggleLike(boolean status) {
        this.likeYn = status ? 1 : 0;
    }
}