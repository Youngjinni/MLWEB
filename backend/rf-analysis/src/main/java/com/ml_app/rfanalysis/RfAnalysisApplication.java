package com.ml_app.rfanalysis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.ml_app.rfanalysis", "com.ml_app.commonmodule"})
@EnableJpaRepositories(basePackages = "com.ml_app.commonmodule.repository") // 레포지토리 경로
@EntityScan(basePackages = "com.ml_app.commonmodule.entity") // 엔티티 경로
public class RfAnalysisApplication {

    public static void main(String[] args) {
        SpringApplication.run(RfAnalysisApplication.class, args);
    }

}
