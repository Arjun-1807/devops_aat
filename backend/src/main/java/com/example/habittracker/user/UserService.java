package com.example.habittracker.user;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AppUser register(String displayName, String username, String password) {
        String normalizedDisplayName = displayName == null ? "" : displayName.trim();
        String normalizedUsername = normalizeUsername(username);
        String normalizedPassword = password == null ? "" : password.trim();

        if (normalizedDisplayName.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Display name is required.");
        }
        if (!normalizedUsername.matches("[a-z0-9._-]{3,32}")) {
            throw new ResponseStatusException(BAD_REQUEST,
                "Username must be 3-32 characters and use only letters, numbers, dot, underscore, or hyphen.");
        }
        if (normalizedPassword.length() < 4) {
            throw new ResponseStatusException(BAD_REQUEST, "Password must be at least 4 characters.");
        }
        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new ResponseStatusException(BAD_REQUEST, "That username is already taken.");
        }

        AppUser user = new AppUser(
            normalizedDisplayName,
            normalizedUsername,
            hashPassword(normalizedPassword)
        );
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AppUser login(String username, String password) {
        String normalizedUsername = normalizeUsername(username);
        String normalizedPassword = password == null ? "" : password.trim();

        AppUser user = userRepository.findByUsernameIgnoreCase(normalizedUsername)
            .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid username or password."));

        if (!hashPassword(normalizedPassword).equals(user.getPasswordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid username or password.");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public AppUser requireExistingUser(String username) {
        return userRepository.findByUsernameIgnoreCase(normalizeUsername(username))
            .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Please sign in with a valid account first."));
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(encoded.length * 2);
            for (byte value : encoded) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 support is required.", exception);
        }
    }
}
