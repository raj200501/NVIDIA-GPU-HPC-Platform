package com.example.paymentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
public class PaymentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}

@Entity
class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Double amount;
    private String status;

    // Getters and setters omitted for brevity
}

interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
}

@RestController
@RequestMapping("/payments")
class PaymentController {
    private final PaymentRepository paymentRepository;

    PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUserId(@PathVariable Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    @PutMapping("/{id}")
    public Payment updatePayment(@RequestBody Payment payment, @PathVariable Long id) {
        return paymentRepository.findById(id).map(p -> {
            p.setAmount(payment.getAmount());
            p.setStatus(payment.getStatus());
            return paymentRepository.save(p);
        }).orElseThrow(() -> new PaymentNotFoundException(id));
    }

    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {
        paymentRepository.deleteById(id);
    }
}

@ResponseStatus(org.springframework.http.HttpStatus.NOT_FOUND)
class PaymentNotFoundException extends RuntimeException {
    PaymentNotFoundException(Long id) {
        super("Could not find payment " + id);
    }
}
