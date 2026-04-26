package com.example.habittracker.habit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.example.habittracker.user.AppUser;
import com.example.habittracker.user.UserService;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class HabitServiceTests {

    @Mock
    private HabitRepository habitRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private HabitService habitService;

    @Test
    void createHabitUsesRegisteredUsername() {
        when(habitRepository.save(any(Habit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userService.requireExistingUser("demo-user"))
            .thenReturn(new AppUser("Demo User", "demo-user", "hashed"));

        Habit habit = habitService.createHabit("Read 10 pages", "demo-user");

        assertThat(habit.getName()).isEqualTo("Read 10 pages");
        assertThat(habit.getUsername()).isEqualTo("demo-user");
        assertThat(habit.getStreak()).isZero();
    }

    @Test
    void markCompleteIncrementsStreakOnConsecutiveDay() {
        Habit existing = new Habit("Workout", "demo-user");
        existing.setStreak(2);
        existing.setLastCompletedDate(LocalDate.now().minusDays(1));

        when(habitRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(habitRepository.save(any(Habit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Habit updated = habitService.markComplete(7L);

        assertThat(updated.getStreak()).isEqualTo(3);
        assertThat(updated.getLastCompletedDate()).isEqualTo(LocalDate.now());
    }
}
