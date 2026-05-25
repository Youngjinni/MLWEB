package com.ml_app.authservice.dto;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String id;
    private String pw;
}
