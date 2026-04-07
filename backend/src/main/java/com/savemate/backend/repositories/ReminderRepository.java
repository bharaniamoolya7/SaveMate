package com.savemate.backend.repositories;

import com.savemate.backend.models.Reminder;
import com.savemate.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserOrderByDateAsc(User user);
    void deleteByUser(User user);
}
