package com.ml_app.commonmodule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ML_USER_TOKEN")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserTokenEntity {

    @Id
    @Column(name = "TOKEN_ID", precision = 19)
    private Long tokenId; // 토큰 고유 PK

    @Column(name = "USER_ID", nullable = false, precision = 19)
    private Long userId; // ML_USER 참조

    @Column(name = "REFRESH_TOKEN", length = 512, nullable = false)
    private String refreshToken; // 서버에서 발급한 리프레시 토큰

    @Column(name = "EXPIRY_DT", nullable = false)
    private LocalDateTime expiryDt; // 토큰 만료 일시

    @CreatedDate
    @Column(name = "CRTR_DT", updatable = false)
    private LocalDateTime crtrDt; // 생성 일시

    @Column(name = "DEVICE_INFO", length = 255)
    private String deviceInfo; // 로그인 기기 정보 (예: Chrome, Android 등)

    // --- 비즈니스 로직: 토큰 갱신 ---
    public void updateToken(String newToken, LocalDateTime newExpiry) {
        this.refreshToken = newToken;
        this.expiryDt = newExpiry;
    }
}