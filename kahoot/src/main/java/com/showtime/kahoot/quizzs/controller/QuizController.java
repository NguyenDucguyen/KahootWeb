package com.showtime.kahoot.quizzs.controller;

import com.showtime.kahoot.quizzs.model.Quiz;
import com.showtime.kahoot.quizzs.service.QuizService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @GetMapping("/{id}")
    public Quiz getQuizById(@PathVariable String id) {
        return quizService.getQuizById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @GetMapping("/user/{userId}")
    public List<Quiz> getQuizByUser(@PathVariable String userId) {
        return quizService.getQuizzesByUser(userId);
    }

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizService.createQuiz(quiz);
    }

    @PutMapping("/{id}")
    public Quiz updateQuiz(@PathVariable String id, @RequestBody Quiz quizDetails) {
        return quizService.updateQuiz(id, quizDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable String id) {
        quizService.deleteQuiz(id);
    }
}
