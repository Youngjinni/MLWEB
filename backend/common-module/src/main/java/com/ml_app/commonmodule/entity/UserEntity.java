package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "ML_USER")
@Getter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @Column(name = "USER_ID")
    private Long userId; // 백엔드에서 생성한 고유 ID

    @Column(nullable = false, unique = true, length = 64)
    private String email;

    @Column(nullable = false, unique = true, length = 64)
    private String id; // 로그인 아이디

    @Column(nullable = false, unique = true, length = 64)
    private String nm; // 닉네임

    @Column(nullable = false, length = 128)
    private String pw; // BCrypt 암호화 비밀번호

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt; // 생성일

    @Column(name = "SUBSC_YN")
    private Integer subscYn; // 0: 미구독, 1: 구독중

    @Column(name = "SUBSC_DT")
    private LocalDateTime subscDt; // 최근 구독 결제 시각

    public void updateSubscription(boolean isSubscribed) {
        this.subscYn = isSubscribed ? 1 : 0;
        this.subscDt = isSubscribed ? LocalDateTime.now() : null;
    }

    public void changePassword(String encryptedPassword) {
        this.pw = encryptedPassword;
    }
}