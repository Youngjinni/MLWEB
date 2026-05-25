package com.ml_app.authservice.dto;

import lombok.Getter;

@Getter
public class SignupRequest {
    private String id;
    private String pw;
    private String nm;
    private String email;
}
