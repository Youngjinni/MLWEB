package com.ml_app.communityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.ml_app") // 전체 패키지 스캔
@EnableJpaRepositories(basePackages = "com.ml_app")     // Repository 스캔 범위 확대
@EntityScan(basePackages = "com.ml_app")
public class CommunityServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommunityServiceApplication.class, args);
    }

}
