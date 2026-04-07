package com.savemate.backend.controllers;

import com.savemate.backend.models.Transaction;
import com.savemate.backend.models.User;
import com.savemate.backend.repositories.CategoryRepository;
import com.savemate.backend.repositories.TransactionRepository;
import com.savemate.backend.repositories.UserRepository;
import com.savemate.backend.repositories.UserCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserCategoryRepository userCategoryRepository;

    private User getAuthUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(Authentication authentication) {
         return ResponseEntity.ok(transactionRepository.findByUserOrderByDateDesc(getAuthUser(authentication)));
    }

    @PostMapping
    public ResponseEntity<?> addTransaction(Authentication authentication, @RequestBody java.util.Map<String, Object> payload) {
        User user = getAuthUser(authentication);
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        
        String categoryName = (String) payload.get("categoryName");
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }
        
        com.savemate.backend.models.Category category = categoryRepository.findByName(categoryName).orElseGet(() -> {
            com.savemate.backend.models.Category newCat = new com.savemate.backend.models.Category();
            newCat.setName(categoryName);
            newCat.setSystem(false);
            return categoryRepository.save(newCat);
        });
        
        // Ensure UserCategory relationship exists
        if (userCategoryRepository.findByUserAndCategoryId(user, category.getId()).isEmpty()) {
            com.savemate.backend.models.UserCategory uc = new com.savemate.backend.models.UserCategory();
            uc.setUser(user);
            uc.setCategory(category);
            uc.setSelected(true);
            uc.setCustomAmount(java.math.BigDecimal.ZERO);
            userCategoryRepository.save(uc);
        }

        transaction.setCategory(category);
        transaction.setAmount(new java.math.BigDecimal(payload.get("amount").toString()));
        transaction.setDate(java.time.LocalDate.parse(payload.get("date").toString()));
        transaction.setDescription((String) payload.get("description"));
        transaction.setType((String) payload.get("type"));
        transaction.setIsReminder((Boolean) payload.get("isReminder"));
        
        transactionRepository.save(transaction);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(Authentication authentication, @PathVariable Long id) {
        Transaction t = transactionRepository.findById(id).orElse(null);
        if (t != null && t.getUser().getId().equals(getAuthUser(authentication).getId())) {
             transactionRepository.delete(t);
        }
        return ResponseEntity.ok().build();
    }
}
