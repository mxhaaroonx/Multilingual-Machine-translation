package com.machinetranslate.chatapp.controller;

import com.machinetranslate.chatapp.model.Message;
import com.machinetranslate.chatapp.model.User;
import com.machinetranslate.chatapp.repository.MessageRepository;
import com.machinetranslate.chatapp.repository.UserRepository;
import com.machinetranslate.chatapp.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.HashMap;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final TranslationService translationService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> payload) {
        String senderUsername   = payload.get("sender");
        String receiverUsername = payload.get("receiver");
        String text             = payload.get("text");

        User sender   = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        String translated = translationService.translate(
                text,
                receiver.getPreferredLanguage()
        );

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setOriginalText(text);
        message.setTranslatedText(translated);
        messageRepository.save(message);

        Map<String, String> receiverPayload = new HashMap<>();
        receiverPayload.put("sender", senderUsername);
        receiverPayload.put("original", text);
        receiverPayload.put("translated", translated);
        receiverPayload.put("timestamp", message.getTimestamp().toString());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + receiverUsername,
                receiverPayload
        );

        Map<String, String> senderPayload = new HashMap<>();
        senderPayload.put("sender", senderUsername);
        senderPayload.put("original", text);
        senderPayload.put("translated", text);
        senderPayload.put("timestamp", message.getTimestamp().toString());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + senderUsername,
                senderPayload
        );
    }
}
