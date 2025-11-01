package com.showtime.kahoot.quizzs.model;

import com.showtime.kahoot.auth.model.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.Date;
import java.util.List;

@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;

    private String title;
    private String description;
    private List<Question> questions;

    private Date startTime;
    private Date endTime;
    private Integer duration; // tổng thời gian (phút)
    private Boolean isActive = false;
    private Integer maxAttempts = 1;

    @DBRef
    private User createdBy; // 🔗 người tạo quiz

    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    public Quiz() {
    }

    public Quiz(String id, String title, String description, List<Question> questions, Date startTime, Date endTime, Integer duration, Boolean isActive, Integer maxAttempts, User createdBy, Date createdAt, Date updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.questions = questions;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.isActive = isActive;
        this.maxAttempts = maxAttempts;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}

