package com.org.petGuard.domain.dashboard;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityItem {
    private String icon;
    private String title;
    private String description;
    private String timestamp;
}
