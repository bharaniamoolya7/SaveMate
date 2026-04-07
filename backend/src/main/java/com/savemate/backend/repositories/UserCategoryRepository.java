package com.savemate.backend.repositories;

import com.savemate.backend.models.UserCategory;
import com.savemate.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCategoryRepository extends JpaRepository<UserCategory, Long> {
    List<UserCategory> findByUser(User user);
    Optional<UserCategory> findByUserAndCategoryId(User user, Long categoryId);
    void deleteByUser(User user);
}
