package com.org.petGuard.domain.user;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
	private Long id;
	private String username;
	private String email;
	private String fullName;
	private String phone;
	private String role;
	private java.time.LocalDateTime createdAt;
}
