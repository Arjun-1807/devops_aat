package com.example.habittracker.habit;

import com.example.habittracker.habit.dto.CreateHabitRequest;
import com.example.habittracker.habit.dto.HabitResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<HabitResponse> listHabits(@RequestParam(required = false) String username) {
        return habitService.listHabits(Optional.ofNullable(username)).stream()
            .map(HabitResponse::from)
            .toList();
    }

    @PostMapping
    public HabitResponse createHabit(@Valid @RequestBody CreateHabitRequest request) {
        return HabitResponse.from(habitService.createHabit(request.getName(), request.getUsername()));
    }

    @PostMapping("/{id}/complete")
    public HabitResponse markComplete(@PathVariable Long id) {
        return HabitResponse.from(habitService.markComplete(id));
    }
}
