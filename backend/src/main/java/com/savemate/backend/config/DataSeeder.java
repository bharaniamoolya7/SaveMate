package com.savemate.backend.config;

import com.savemate.backend.models.Category;
import com.savemate.backend.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = Arrays.asList(
                    "Housing (Rent/Mortgage)", "Groceries", "Dining Out", "Transportation (Fuel/Transit)",
                    "Utilities (Electricity/Water/Gas)", "Internet & Phone", "Health & Medical", "Education",
                    "Entertainment", "Shopping & Clothes", "Personal Care", "Gym & Fitness",
                    "Home Maintenance", "Vehicle Maintenance", "Insurances", "Subscriptions",
                    "Travel & Vacations", "Gifts & Donations", "Investments", "Savings",
                    "Debt Repayment", "Childcare", "Pet Care", "Taxes", "Freelance Expenses",
                    "Hobbies", "Legal Fees", "Bank Fees", "Office Supplies", "Miscellaneous"
            );

            for (String catName : defaultCategories) {
                Category cat = new Category();
                cat.setName(catName);
                cat.setDefaultAmount(new BigDecimal("0.00"));
                cat.setSystem(true);
                categoryRepository.save(cat);
            }
        }
    }
}
