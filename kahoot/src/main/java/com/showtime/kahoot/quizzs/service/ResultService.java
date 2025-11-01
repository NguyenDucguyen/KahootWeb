package com.showtime.kahoot.quizzs.service;

import com.showtime.kahoot.quizzs.model.Result;
import com.showtime.kahoot.quizzs.repository.ResultRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ResultService {
    private final ResultRepository resultRepository;

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public Optional<Result> getResultById(String id) {
        return resultRepository.findById(id);
    }

    public List<Result> getResultsByUser(String userId) {
        return resultRepository.findByUserId(userId);
    }

    public List<Result> getResultsByQuiz(String quizId) {
        return resultRepository.findByQuizId(quizId);
    }

    public Result createResult(Result result) {
        return resultRepository.save(result);
    }

    public void deleteResult(String id) {
        resultRepository.deleteById(id);
    }
}
