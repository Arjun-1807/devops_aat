package com.example.habittracker.user;

import com.example.habittracker.user.dto.AuthRequest;
import com.example.habittracker.user.dto.RegisterRequest;
import com.example.habittracker.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return UserResponse.from(
            userService.register(request.getDisplayName(), request.getUsername(), request.getPassword())
        );
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody AuthRequest request) {
        return UserResponse.from(userService.login(request.getUsername(), request.getPassword()));
    }
}
