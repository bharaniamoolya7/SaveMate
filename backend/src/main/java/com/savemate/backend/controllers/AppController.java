package com.savemate.backend.controllers;

import com.savemate.backend.models.User;
import com.savemate.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class AppController {

    @Autowired
    private UserRepository userRepository;

    private User getAuthUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName()).orElseThrow();
    }

    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        User user = getAuthUser(authentication);
        
        // Return DTO to avoid exposing password
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "fullName", user.getFullName(),
            "monthlySalary", user.getMonthlySalary(),
            "loanEmis", user.getLoanEmis(),
            "otherDeductions", user.getOtherDeductions(),
            "housingRent", user.getHousingRent(),
            "otherCustom", user.getOtherCustom(),
            "targetSavings", user.getTargetSavings(),
            "incomeTaxPercentage", user.getIncomeTaxPercentage()
        ));
    }

    @PostMapping("/details")
    public ResponseEntity<?> updateUserDetails(Authentication authentication, @RequestBody Map<String, Object> body) {
        User user = getAuthUser(authentication);
        
        if (body.containsKey("fullName") && body.get("fullName") != null) user.setFullName(body.get("fullName").toString());
        if (body.containsKey("monthlySalary")) user.setMonthlySalary(new BigDecimal(body.get("monthlySalary").toString()));
        if (body.containsKey("loanEmis")) user.setLoanEmis(new BigDecimal(body.get("loanEmis").toString()));
        if (body.containsKey("otherDeductions")) user.setOtherDeductions(new BigDecimal(body.get("otherDeductions").toString()));
        if (body.containsKey("housingRent")) user.setHousingRent(new BigDecimal(body.get("housingRent").toString()));
        if (body.containsKey("otherCustom")) user.setOtherCustom(new BigDecimal(body.get("otherCustom").toString()));
        if (body.containsKey("targetSavings")) user.setTargetSavings(new BigDecimal(body.get("targetSavings").toString()));
        if (body.containsKey("incomeTaxPercentage")) user.setIncomeTaxPercentage(Integer.parseInt(body.get("incomeTaxPercentage").toString()));
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Updated successfully"));
    }
}
