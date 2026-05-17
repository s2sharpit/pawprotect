package com.org.petGuard.domain.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.org.petGuard.core.security.UserPrincipal;
import com.org.petGuard.domain.user.User;
import com.org.petGuard.domain.user.UserRepository;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return buildCookieResponse(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return buildCookieResponse(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        String fullName = principal.getFullName();
        if (fullName == null) {
            // Fallback for older tokens that don't have fullName claim
            User user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            fullName = user.getFullName();
        }

        AuthResponse response = AuthResponse.builder()
                .userId(principal.getUserId())
                .email(principal.getEmail())
                .fullName(fullName)
                .role(principal.getRole())
                .build();
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<AuthResponse> buildCookieResponse(AuthResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(24 * 60 * 60) // 1 day
                .sameSite("Lax")
                .build();

        // Remove token from response body to prevent storing it in JS
        // memory/localStorage
        response.setToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }
}
