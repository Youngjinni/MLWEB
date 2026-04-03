package com.ml_app.communityservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain communityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF 비활성화 (POST 요청 시 403 에러의 주범입니다)
                .csrf(csrf -> csrf.disable())

                // 2. CORS 설정 적용 (프론트 3000번 포트 허용)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. 세션을 사용하지 않음 (JWT 방식 대비)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 커뮤니티 API는 우선 모두 허용 (테스트를 위해)
                        .requestMatchers("/api/community/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // CORS 세부 설정 (브라우저의 OPTIONS 요청 및 헤더 허용)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000")); // 리액트 주소
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true); // 쿠키나 인증 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}