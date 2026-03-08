package com.machinetranslate.chatapp.service;

import com.machinetranslate.chatapp.model.OtpToken;
import com.machinetranslate.chatapp.model.User;
import com.machinetranslate.chatapp.repository.OtpTokenRepository;
import com.machinetranslate.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;

    @Value("${otp.expiry.minutes}")
    private int otpExpiryMinutes;

    // Step 1 — Register email + password, send OTP
    public void initiateRegistration(String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        // Delete any existing OTPs for this email
        otpTokenRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtp(passwordEncoder.encode(otp));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otpTokenRepository.save(token);

        // Store password temporarily in OTP token (we'll use it after verification)
        // Actually store hashed password in a temp user
        User tempUser = new User();
        tempUser.setEmail(email);
        tempUser.setPassword(passwordEncoder.encode(password));
        tempUser.setUsername("user_" + System.currentTimeMillis());
        tempUser.setVerified(false);
        userRepository.save(tempUser);

        emailService.sendOtp(email, otp);
    }

    // Step 2 — Verify OTP
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findTopByEmailOrderByExpiresAtDesc(email);
        if (tokenOpt.isEmpty()) return false;

        OtpToken token = tokenOpt.get();
        if (token.isUsed()) return false;
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) return false;
        if (!passwordEncoder.matches(otp, token.getOtp())) return false;

        token.setUsed(true);
        otpTokenRepository.save(token);

        // Mark user as verified
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setVerified(true);
            userRepository.save(user);
        });

        return true;
    }

    // Step 3 — Complete profile setup
    public User completeProfile(String email, String username, String bio, MultipartFile photo) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }

        user.setUsername(username);
        user.setBio(bio);

        if (photo != null && !photo.isEmpty()) {
            String photoUrl = cloudinaryService.uploadImage(photo);
            user.setProfilePhotoUrl(photoUrl);
        }

        return userRepository.save(user);
    }

    // Login with email + password
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email first");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    // Update settings
    public User updateSettings(Long userId, String preferredLanguage, String bio,
                               String username, MultipartFile photo) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (preferredLanguage != null && !preferredLanguage.isEmpty()) {
            user.setPreferredLanguage(preferredLanguage);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (username != null && !username.isEmpty() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(username);
        }
        if (photo != null && !photo.isEmpty()) {
            String photoUrl = cloudinaryService.uploadImage(photo);
            user.setProfilePhotoUrl(photoUrl);
        }

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query);
    }
}