package com.example.habittracker.habit;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUsernameIgnoreCaseOrderByIdAsc(String username);

    List<Habit> findAllByOrderByIdAsc();
}
