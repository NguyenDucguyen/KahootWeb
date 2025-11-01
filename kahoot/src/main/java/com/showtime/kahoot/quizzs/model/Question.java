package com.showtime.kahoot.quizzs.model;

public class Question {

    private String question;
    private String questionType; // multiple-choice, fill-in-blank, image-question
    private String questionImage;

    private String[] options; // các lựa chọn nếu là multiple-choice

    private Integer correctAnswer;     // chỉ số đáp án đúng (0–3)
    private String correctAnswerText;  // đáp án text nếu fill-in-blank

    private Integer points = 1;        // số điểm của câu hỏi

    private Integer timeLimit = 30;    // ⏱ thời gian trả lời tính bằng giây (mặc định 30s)

    public Question() {
    }

    public Question(String question, String questionType, String questionImage, String[] options, Integer correctAnswer, String correctAnswerText, Integer points, Integer timeLimit) {
        this.question = question;
        this.questionType = questionType;
        this.questionImage = questionImage;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.correctAnswerText = correctAnswerText;
        this.points = points;
        this.timeLimit = timeLimit;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getQuestionImage() {
        return questionImage;
    }

    public void setQuestionImage(String questionImage) {
        this.questionImage = questionImage;
    }

    public String[] getOptions() {
        return options;
    }

    public void setOptions(String[] options) {
        this.options = options;
    }

    public Integer getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(Integer correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getCorrectAnswerText() {
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText) {
        this.correctAnswerText = correctAnswerText;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }
}
