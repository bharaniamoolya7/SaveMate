package com.savemate.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private BigDecimal monthlySalary = BigDecimal.ZERO;
    private BigDecimal loanEmis = BigDecimal.ZERO;
    private BigDecimal otherDeductions = BigDecimal.ZERO;
    private BigDecimal targetSavings = BigDecimal.ZERO;
    private int incomeTaxPercentage = 0; // 0, 5, 10, 20, 30

    private String fullName;
    private BigDecimal housingRent = BigDecimal.ZERO;
    private BigDecimal otherCustom = BigDecimal.ZERO;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Transaction> transactions = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<UserCategory> userCategories = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Reminder> reminders = new java.util.ArrayList<>();
}
