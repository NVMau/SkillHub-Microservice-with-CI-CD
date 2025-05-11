package com.vmaudev.blog_service.dto;

import lombok.Data;

@Data
public class PostStatsResponse {
    private String postId;
    private long likeCount;
    private long commentCount;
} 