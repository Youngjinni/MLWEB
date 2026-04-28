package com.ml_app.gatewayservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

// 💡 핵심: DB 자동 설정을 아예 사용하지 않겠다고 선언합니다.
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class GatewayServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}
}
