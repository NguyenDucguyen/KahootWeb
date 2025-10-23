package com.showtime.kahoot.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs; // in milliseconds

    private Key signingKey;

    // ✅ Tạo key một lần khi khởi động app
    @PostConstruct
    public void init() {
        signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ✅ Tạo JWT token
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Trích xuất username từ token
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ✅ Kiểm tra token có hợp lệ không
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ✅ Kiểm tra token hết hạn chưa
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ✅ Trích xuất ngày hết hạn
    public Date extractExpiration(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }

    // ===================================================================
    // HÀM MỚI ĐƯỢC BỔ SUNG
    // ===================================================================

    /**
     * Tạo JWT token từ userId và danh sách roles (dùng cho admin login).
     * Hàm này linh hoạt hơn, không phụ thuộc vào UserDetails.
     *
     * @param userId ID của người dùng (ví dụ: "admin" hoặc ID từ MongoDB).
     * @param roles  Danh sách vai trò (ví dụ: List.of("ROLE_ADMIN")).
     * @return Chuỗi JWT.
     */
    public String createToken(String userId, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Sử dụng Claims object để thêm nhiều thông tin
        Claims claims = Jwts.claims().setSubject(userId);
        claims.put("roles", roles);

        return Jwts.builder()
                .setClaims(claims) // Đặt toàn bộ claims đã tạo
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
