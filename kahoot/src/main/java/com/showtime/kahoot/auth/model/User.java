package com.showtime.kahoot.auth.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;


import java.math.BigDecimal;
import java.time.LocalDateTime;



@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String fullName;
    @Indexed(unique = true)

    private Role role;
    private LocalDateTime createdAt;
    private String refCode;
    private String referrerCode;
    private BigDecimal balance = BigDecimal.ZERO;
    private boolean lock = false;

    public String getId() {
        return id;
    }

    public @Email @NotBlank String getEmail() {
        return email;
    }

    public @NotBlank String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    public Role getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getRefCode() {
        return refCode;
    }

    public String getReferrerCode() {
        return referrerCode;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public boolean isLock() {
        return lock;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(@Email @NotBlank String email) {
        this.email = email;
    }

    public void setPassword(@NotBlank String password) {
        this.password = password;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setRefCode(String refCode) {
        this.refCode = refCode;
    }

    public void setReferrerCode(String referrerCode) {
        this.referrerCode = referrerCode;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public void setLock(boolean lock) {
        this.lock = lock;
    }
}
