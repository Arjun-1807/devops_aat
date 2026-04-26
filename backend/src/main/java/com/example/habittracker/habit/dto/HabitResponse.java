package com.example.habittracker.habit.dto;

import com.example.habittracker.habit.Habit;
import java.time.LocalDate;

public class HabitResponse {

    private Long id;
    private String name;
    private String username;
    private int streak;
    private LocalDate lastCompletedDate;

    public static HabitResponse from(Habit habit) {
        HabitResponse response = new HabitResponse();
        response.id = habit.getId();
        response.name = habit.getName();
        response.username = habit.getUsername();
        response.streak = habit.getStreak();
        response.lastCompletedDate = habit.getLastCompletedDate();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public int getStreak() {
        return streak;
    }

    public LocalDate getLastCompletedDate() {
        return lastCompletedDate;
    }
}
