package com.showtime.kahoot.auth.dto;


public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String referrerCode;

    public RegisterRequest() {
    }

    public RegisterRequest(String fullName, String email, String password, String referrerCode) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.referrerCode = referrerCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getReferrerCode() {
        return referrerCode;
    }

    public void setReferrerCode(String referrerCode) {
        this.referrerCode = referrerCode;
    }
}

