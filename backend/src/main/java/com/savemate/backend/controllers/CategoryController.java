package com.savemate.backend.controllers;

import com.savemate.backend.models.User;
import com.savemate.backend.models.UserCategory;
import com.savemate.backend.repositories.CategoryRepository;
import com.savemate.backend.repositories.UserCategoryRepository;
import com.savemate.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserCategoryRepository userCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsSystemTrue());
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserCategories(Authentication authentication) {
        User user = getAuthUser(authentication);
        List<UserCategory> ucs = userCategoryRepository.findByUser(user);
        return ResponseEntity.ok(ucs);
    }

    @PostMapping("/user")
    public ResponseEntity<?> updateUserCategories(Authentication authentication, @RequestBody List<Map<String, Object>> requests) {
        User user = getAuthUser(authentication);
        for(Map<String, Object> req : requests) {
            Long catId = Long.valueOf(req.get("categoryId").toString());
            boolean isSelected = Boolean.parseBoolean(req.get("isSelected").toString());
            BigDecimal amount = new BigDecimal(req.getOrDefault("customAmount", "0").toString());

            UserCategory uc = userCategoryRepository.findByUserAndCategoryId(user, catId).orElse(new UserCategory());
            if (uc.getId() == null) {
                uc.setUser(user);
                uc.setCategory(categoryRepository.findById(catId).orElseThrow());
            }
            uc.setSelected(isSelected);
            uc.setCustomAmount(amount);
            userCategoryRepository.save(uc);
        }
        return ResponseEntity.ok(Map.of("message", "Updated successfully"));
    }
}
