package com.machinetranslate.chatapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Your BharatChat verification code");
            helper.setText(
                    "<div style='font-family: sans-serif; max-width: 400px; margin: auto;'>" +
                            "<h2 style='color: #667eea;'>🌐 BharatChat</h2>" +
                            "<p>Your verification code is:</p>" +
                            "<h1 style='letter-spacing: 8px; color: #333;'>" + otp + "</h1>" +
                            "<p style='color: #888; font-size: 13px;'>This code expires in 10 minutes.</p>" +
                            "</div>",
                    true
            );

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}