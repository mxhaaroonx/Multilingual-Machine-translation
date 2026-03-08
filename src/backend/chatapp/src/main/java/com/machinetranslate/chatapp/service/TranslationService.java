package com.machinetranslate.chatapp.service;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TranslationService {

    @Value("${translator.api.url}")
    private String translatorApiUrl;

    private final RestTemplate restTemplate;

    public String translate(String text, String targetLanguage) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("text", text);
            request.put("target_language", targetLanguage);

            Map response = restTemplate.postForObject(
                    translatorApiUrl + "/translate",
                    request,
                    Map.class
            );

            return (String) response.get("translation");
        } catch (Exception e) {
            // If translation fails, return original text
            // so the chat doesn't break
            return text;
        }
    }
}
