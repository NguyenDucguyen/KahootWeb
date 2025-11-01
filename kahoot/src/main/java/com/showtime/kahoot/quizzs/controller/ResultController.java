package com.showtime.kahoot.quizzs.controller;

import com.showtime.kahoot.quizzs.model.Result;
import com.showtime.kahoot.quizzs.service.ResultService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin
public class ResultController {
    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    public List<Result> getAllResults() {
        return resultService.getAllResults();
    }

    @GetMapping("/{id}")
    public Result getResultById(@PathVariable String id) {
        return resultService.getResultById(id).orElseThrow(() -> new RuntimeException("Result not found"));
    }

    @GetMapping("/user/{userId}")
    public List<Result> getResultsByUser(@PathVariable String userId) {
        return resultService.getResultsByUser(userId);
    }

    @GetMapping("/quiz/{quizId}")
    public List<Result> getResultsByQuiz(@PathVariable String quizId) {
        return resultService.getResultsByQuiz(quizId);
    }

    @PostMapping
    public Result createResult(@RequestBody Result result) {
        return resultService.createResult(result);
    }

    @DeleteMapping("/{id}")
    public void deleteResult(@PathVariable String id) {
        resultService.deleteResult(id);
    }
}
