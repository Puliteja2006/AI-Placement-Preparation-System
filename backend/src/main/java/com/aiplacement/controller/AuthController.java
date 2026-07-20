package com.aiplacement.controller;

import com.aiplacement.dto.JwtResponse;
import com.aiplacement.dto.LoginRequest;
import com.aiplacement.dto.RegisterRequest;
import com.aiplacement.entity.User;
import com.aiplacement.security.JwtTokenProvider;
import com.aiplacement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "https://ai-placement-frontend-v6qc.onrender.com")
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.registerUser(registerRequest);
            return ResponseEntity.ok("User registered successfully with role " + user.getRole() + "!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Error: User not found in database."));

            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .cgpa(user.getCgpa())
                    .graduationYear(user.getGraduationYear())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials: " + e.getMessage());
        }
    }
}
