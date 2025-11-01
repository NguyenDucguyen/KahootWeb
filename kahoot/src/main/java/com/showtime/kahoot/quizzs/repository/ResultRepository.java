package com.showtime.kahoot.quizzs.repository;

import com.showtime.kahoot.quizzs.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResultRepository extends MongoRepository<Result, String> {
    List<Result> findByUserId(String userId);
    List<Result> findByQuizId(String quizId);
}