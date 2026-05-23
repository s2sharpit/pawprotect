package com.org.petGuard.domain.user;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
	private Long id;
	private String email;
	private String fullName;
	private String phone;
	private String role;
	private java.time.LocalDateTime createdAt;
	private java.util.List<UserPetDto> pets;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserPetDto {
		private Long id;
		private String name;
		private String species;
		private String breed;
		private String eligibilityStatus;
		private java.util.List<UserPolicyDto> policies;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserPolicyDto {
		private Long id;
		private String planName;
		private String status;
		private java.time.LocalDate startDate;
		private java.time.LocalDate endDate;
	}
}
