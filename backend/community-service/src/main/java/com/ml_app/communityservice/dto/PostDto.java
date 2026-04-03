package com.ml_app.communityservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {
    private String postNm;
    private String cont;
    private String imgUrl;
}
