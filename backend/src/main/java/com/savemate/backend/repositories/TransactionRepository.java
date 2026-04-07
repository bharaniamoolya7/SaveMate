package com.savemate.backend.repositories;

import com.savemate.backend.models.Transaction;
import com.savemate.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(User user);
    List<Transaction> findByUserAndTypeOrderByDateDesc(User user, String type);
    void deleteByUser(User user);
}
