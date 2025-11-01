package com.showtime.kahoot.quizzs.model;

import com.showtime.kahoot.auth.model.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.Date;
import java.util.List;

@Document(collection = "results")
public class Result {
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Quiz quiz;

    private List<Answer> answers;

    private Integer totalScore;
    private Integer maxScore;
    private Double percentage;

    private Date completedAt = new Date();
    private Integer timeTaken; // tổng thời gian làm quiz (giây)
    private Integer cheatingAttempts = 0;

    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}


