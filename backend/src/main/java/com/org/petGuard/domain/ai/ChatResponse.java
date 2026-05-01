package com.org.petGuard.domain.ai;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private java.time.LocalDateTime timestamp;
}
