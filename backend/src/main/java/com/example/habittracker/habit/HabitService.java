package com.example.habittracker.habit;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class HabitService {

    private final HabitRepository habitRepository;

    public HabitService(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    @Transactional
    public Habit createHabit(String name, String username) {
        String normalizedUsername = (username == null || username.isBlank()) ? "demo-user" : username.trim();
        Habit habit = new Habit(name.trim(), normalizedUsername);
        return habitRepository.save(habit);
    }

    @Transactional(readOnly = true)
    public List<Habit> listHabits(Optional<String> username) {
        if (username.isPresent() && !username.get().isBlank()) {
            return habitRepository.findByUsernameIgnoreCaseOrderByIdAsc(username.get().trim());
        }
        return habitRepository.findAllByOrderByIdAsc();
    }

    @Transactional
    public Habit markComplete(Long id) {
        Habit habit = habitRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Habit not found: " + id));

        LocalDate today = LocalDate.now();
        LocalDate lastDate = habit.getLastCompletedDate();

        if (today.equals(lastDate)) {
            return habit;
        }

        if (lastDate != null && today.minusDays(1).equals(lastDate)) {
            habit.setStreak(habit.getStreak() + 1);
        } else {
            habit.setStreak(1);
        }

        habit.setLastCompletedDate(today);
        return habitRepository.save(habit);
    }
}
