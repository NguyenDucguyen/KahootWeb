package com.showtime.kahoot.quizzs.repository;

import com.showtime.kahoot.quizzs.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCreatedById(String userId);
}

