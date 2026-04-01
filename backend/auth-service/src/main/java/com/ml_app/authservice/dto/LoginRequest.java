package com.ml_app.authservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String id; // 로그인 아이디
    private String pw; // 비밀번호
}
