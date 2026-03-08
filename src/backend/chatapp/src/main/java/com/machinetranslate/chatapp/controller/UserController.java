package com.machinetranslate.chatapp.controller;

import com.machinetranslate.chatapp.model.User;
import com.machinetranslate.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    // Step 1 — Send OTP
    @PostMapping("/register/initiate")
    public ResponseEntity<?> initiateRegistration(@RequestBody Map<String, String> body) {
        try {
            userService.initiateRegistration(
                    body.get("email"),
                    body.get("password")
            );
            return ResponseEntity.ok(Map.of("message", "OTP sent to " + body.get("email")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Step 2 — Verify OTP
    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        boolean verified = userService.verifyOtp(body.get("email"), body.get("otp"));
        if (verified) {
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }
    }

    // Step 3 — Complete profile
    @PostMapping("/register/complete")
    public ResponseEntity<?> completeProfile(
            @RequestParam("email") String email,
            @RequestParam("username") String username,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        try {
            User user = userService.completeProfile(email, username, bio, photo);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = userService.login(body.get("email"), body.get("password"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search users
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    // Update settings
    @PutMapping("/settings/{userId}")
    public ResponseEntity<?> updateSettings(
            @PathVariable Long userId,
            @RequestParam(value = "preferredLanguage", required = false) String preferredLanguage,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        try {
            User user = userService.updateSettings(userId, preferredLanguage, bio, username, photo);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}