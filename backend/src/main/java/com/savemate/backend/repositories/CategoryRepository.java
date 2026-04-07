package com.savemate.backend.repositories;

import com.savemate.backend.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsSystemTrue();
    java.util.Optional<Category> findByName(String name);
}
