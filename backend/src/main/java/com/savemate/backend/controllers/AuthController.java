package com.savemate.backend.controllers;

import com.savemate.backend.models.User;
import com.savemate.backend.repositories.*;
import com.savemate.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserCategoryRepository userCategoryRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody Map<String, String> authenticationRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.get("username"), authenticationRequest.get("password"))
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect username or password"));
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authenticationRequest.get("username"));

        final String jwt = jwtUtil.generateToken(userDetails);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/account")
    @Transactional
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Manual Cascade Delete via Repositories to ensure complete wipe
        transactionRepository.deleteByUser(user);
        userCategoryRepository.deleteByUser(user);
        reminderRepository.deleteByUser(user);
        
        userRepository.delete(user);
        SecurityContextHolder.clearContext();
        
        return ResponseEntity.ok(Map.of("message", "Your account is successfully deleted"));
    }
}
