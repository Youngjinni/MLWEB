package com.ml_app.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.ml_app.authservice") // 전체 패키지 스캔
@EnableJpaRepositories(basePackages = "com.ml_app")     // 레포지토리 스캔
@EntityScan(basePackages = "com.ml_app")               // 엔티티 스캔
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
