package com.showtime.kahoot.auth.repository;

import com.showtime.kahoot.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByRefCode(String refCode);
    List<User> findByReferrerCode(String referrerCode); // ✅ dùng để tìm F1
    boolean existsByRefCode(String refCode);
    long countByReferrerCode(String refCode);


}