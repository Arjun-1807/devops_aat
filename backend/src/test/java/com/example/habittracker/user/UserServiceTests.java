package com.example.habittracker.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void registerNormalizesUsernameBeforeSaving() {
        when(userRepository.existsByUsernameIgnoreCase("arjun")).thenReturn(false);
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppUser user = userService.register("Arjun Gowda", " Arjun ", "pass1234");

        assertThat(user.getDisplayName()).isEqualTo("Arjun Gowda");
        assertThat(user.getUsername()).isEqualTo("arjun");
        assertThat(user.getPasswordHash()).isNotBlank();
    }

    @Test
    void loginRejectsInvalidPassword() {
        String validHash = "bd94dcda26fccb4e68d6a31f9b5aac0b571ae266d822620e901ef7ebe3a11d4f";
        AppUser existing = new AppUser("Arjun Gowda", "arjun", validHash);
        when(userRepository.findByUsernameIgnoreCase("arjun")).thenReturn(java.util.Optional.of(existing));

        assertThatThrownBy(() -> userService.login("arjun", "wrong"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("401 UNAUTHORIZED");
    }
}
