package com.example.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}

class AuthRequest {
    public String email;
    public String password;
}

class AuthResponse {
    public String token;

    AuthResponse(String token) {
        this.token = token;
    }
}

@RestController
@RequestMapping("/auth")
class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    AuthController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(request.password, user.getPassword())) {
            String token = jwtTokenProvider.createToken(request.email);
            return new AuthResponse(token);
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}

class JwtTokenProvider {
    public String createToken(String email) {
        // Simplified token creation, replace with actual JWT creation
        return "token-" + email + "-" + System.currentTimeMillis();
    }
}

interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

@Entity
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String password;

    // Getters and setters omitted for brevity
}
