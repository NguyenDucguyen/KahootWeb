package com.showtime.kahoot.quizzs.service;

import com.showtime.kahoot.quizzs.model.Quiz;
import com.showtime.kahoot.quizzs.repository.QuizRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Optional<Quiz> getQuizById(String id) {
        return quizRepository.findById(id);
    }

    public List<Quiz> getQuizzesByUser(String userId) {
        return quizRepository.findByCreatedById(userId);
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(String id, Quiz quizDetails) {
        return quizRepository.findById(id).map(existing -> {
            existing.setTitle(quizDetails.getTitle());
            existing.setDescription(quizDetails.getDescription());
            existing.setQuestions(quizDetails.getQuestions());
            existing.setDuration(quizDetails.getDuration());
            existing.setStartTime(quizDetails.getStartTime());
            existing.setEndTime(quizDetails.getEndTime());
            existing.setMaxAttempts(quizDetails.getMaxAttempts());
            existing.setActive(quizDetails.getActive());
            return quizRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public void deleteQuiz(String id) {
        quizRepository.deleteById(id);
    }
}