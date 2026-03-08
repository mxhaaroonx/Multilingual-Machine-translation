package com.machinetranslate.chatapp.repository;

import com.machinetranslate.chatapp.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailOrderByExpiresAtDesc(String email);
    void deleteByEmail(String email);
}
