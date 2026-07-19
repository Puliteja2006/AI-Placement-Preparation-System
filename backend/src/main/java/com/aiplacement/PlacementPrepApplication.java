package com.aiplacement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.aiplacement.repository.UserRepository;
import com.aiplacement.entity.User;

@SpringBootApplication
public class PlacementPrepApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlacementPrepApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("sa").isEmpty()) {
                User student = User.builder()
                        .username("sa")
                        .email("student@prep.edu")
                        .password(passwordEncoder.encode("password"))
                        .role("ROLE_STUDENT")
                        .cgpa(8.2)
                        .graduationYear(2026)
                        .build();
                userRepository.save(student);
                System.out.println(">>> Seeded Demo Student account: sa / password");
            }
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@prep.edu")
                        .password(passwordEncoder.encode("password"))
                        .role("ROLE_ADMIN")
                        .cgpa(9.0)
                        .graduationYear(2026)
                        .build();
                userRepository.save(admin);
                System.out.println(">>> Seeded Demo Admin account: admin / password");
            }
        };
    }
}
