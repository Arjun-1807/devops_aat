package com.example.habittracker.user.dto;

import com.example.habittracker.user.AppUser;

public class UserResponse {

    private Long id;
    private String displayName;
    private String username;

    public static UserResponse from(AppUser user) {
        UserResponse response = new UserResponse();
        response.id = user.getId();
        response.displayName = user.getDisplayName();
        response.username = user.getUsername();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getUsername() {
        return username;
    }
}
