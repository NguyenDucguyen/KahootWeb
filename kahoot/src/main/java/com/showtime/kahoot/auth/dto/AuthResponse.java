package com.showtime.kahoot.auth.dto;

import com.showtime.kahoot.auth.model.User;
public class AuthResponse {
    private String token;
    private User user;

    public AuthResponse() {
    }

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

