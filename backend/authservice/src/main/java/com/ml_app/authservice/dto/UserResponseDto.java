package com.ml_app.authservice.dto;

import com.ml_app.commonmodule.entity.UserEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 수정: /auth/me 응답에 UserEntity 직접 반환 시 pw(해시)가 노출되는 문제 해결.
 * pw 필드를 제외한 안전한 응답 DTO.
 */
@Getter
@Builder
public class UserResponseDto {

    private Long   userId;
    private String id;       // 로그인 아이디
    private String nm;
    private String email;
    private Integer subscYn;
    private LocalDateTime subscDt;
    private LocalDateTime crtrDt;

    public static UserResponseDto from(UserEntity user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .id(user.getId())
                .nm(user.getNm())
                .email(user.getEmail())
                .subscYn(user.getSubscYn())
                .subscDt(user.getSubscDt())
                .crtrDt(user.getCrtrDt())
                .build();
    }
}
