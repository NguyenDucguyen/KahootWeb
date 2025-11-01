package com.showtime.kahoot.quizzs.model;

import java.util.Date;

public class Answer {
    private String questionId;
    private Integer selectedAnswer;
    private String textAnswer;
    private Boolean isCorrect;
    private Integer points;

    public Answer(String questionId, Integer selectedAnswer, String textAnswer, Boolean isCorrect, Integer points, Date answeredAt) {
        this.questionId = questionId;
        this.selectedAnswer = selectedAnswer;
        this.textAnswer = textAnswer;
        this.isCorrect = isCorrect;
        this.points = points;
        this.answeredAt = answeredAt;
    }

    public Answer() {
    }

    private Date answeredAt = new Date(); // 🕒 thời điểm người chơi gửi câu trả lời

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Integer getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(Integer selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Date getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(Date answeredAt) {
        this.answeredAt = answeredAt;
    }
}
