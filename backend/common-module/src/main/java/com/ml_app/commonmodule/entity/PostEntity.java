package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_COMM_POST")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PostEntity {

    @Id
    @Column(name = "POST_ID")
    private Long postId; // 게시글 고유 ID

    @Column(name = "USER_ID", nullable = false)
    private Long userId; // 작성자 ID

    @Builder.Default
    @Column(name = "POST_NM")
    private String postNm = "제목 없음";

    @Builder.Default
    @Column(name = "LIKE_CNT")
    private Long likeCnt = 0L;

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt;

    @Lob // SQL의 CLOB 반영 (긴 URL이나 인코딩된 이미지 데이터 대응)
    @Column(name = "IMG_URL")
    private String imgUrl;

    @Builder.Default
    @Column(name = "CONT")
    private String cont = "내용 없음";

    @Builder.Default
    @Column(name = "VIEW_CNT")
    private Long viewCnt = 0L;

    // --- 비즈니스 로직 ---

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCnt++;
    }

    /**
     * 좋아요 수 업데이트 (증가/감소)
     */
    public void updateLikeCount(boolean isPlus) {
        this.likeCnt = isPlus ? this.likeCnt + 1 : Math.max(0, this.likeCnt - 1);
    }

    /**
     * 게시글 수정
     */
    public void updatePost(String title, String content, String imgUrl) {
        this.postNm = title;
        this.cont = content;
        this.imgUrl = imgUrl;
    }
}