package com.ml_app.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor  // 이거 추가!
@AllArgsConstructor // 이것도 추가해주면 좋습니다.
public class SignupRequest {
    private String id;
    private String email;
    private String nm;
    private String pw;
}