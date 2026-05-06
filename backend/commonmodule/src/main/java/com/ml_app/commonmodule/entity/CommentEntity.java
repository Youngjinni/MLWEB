package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_COMM_CMET")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CommentEntity {

    @Id
    @Column(name = "CMET_ID")
    private Long cmetId; // 댓글 고유 ID

    @Column(name = "POST_ID", nullable = false)
    private Long postId; // 연결된 게시글 ID

    @Column(name = "USER_ID", nullable = false)
    private Long userId; // 작성자 ID

    @Builder.Default
    @Column(name = "LIKE_CNT")
    private Long likeCnt = 0L;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;

    @Column(name = "CONT", length = 4000)
    private String cont; // 댓글 내용

    // --- 비즈니스 로직 ---

    /**
     * 댓글 내용 수정
     */
    public void updateContent(String newContent) {
        this.cont = newContent;
    }

    /**
     * 댓글 좋아요 수 업데이트
     */
    public void updateLikeCount(boolean isPlus) {
        this.likeCnt = isPlus ? this.likeCnt + 1 : Math.max(0, this.likeCnt - 1);
    }
}