package com.example.habittracker.habit.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateHabitRequest {

    @NotBlank
    private String name;

    private String username;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
