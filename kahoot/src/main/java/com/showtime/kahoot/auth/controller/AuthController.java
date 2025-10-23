package com.showtime.kahoot.auth.controller;

import com.showtime.kahoot.auth.dto.ApiResponse;
import com.showtime.kahoot.auth.dto.AuthResponse;
import com.showtime.kahoot.auth.dto.LoginRequest;
import com.showtime.kahoot.auth.dto.RegisterRequest;
import com.showtime.kahoot.auth.model.Role;
import com.showtime.kahoot.auth.model.User;
import com.showtime.kahoot.auth.repository.UserRepository;
import com.showtime.kahoot.auth.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // Inject thông tin admin từ file properties
    @Value("${quiz.admin.email}")
    private String adminEmail;
    @Value("${quiz.admin.password}")
    private String adminPassword;

    @Autowired
    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * API ĐĂNG KÝ cho tài khoản Sinh viên.
     */
    @PostMapping("/user/register")
    public ResponseEntity<ApiResponse> registerStudent(@RequestBody RegisterRequest request) {
        try {
            // 1. Kiểm tra dữ liệu đầu vào (uniqueness)
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.fail("Lỗi: Email đã được sử dụng!"));
            }


            // 2. Tạo đối tượng User mới
            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            // Mã hóa mật khẩu
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            // Thiết lập các giá trị mặc định
            user.setRole(Role.USER); // Gán vai trò là sinh viên
            user.setCreatedAt(LocalDateTime.now());

            // 3. Lưu vào cơ sở dữ liệu
            User newUser =     userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Đăng ký tài khoản sinh viên thành công", newUser));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Có lỗi xảy ra trong quá trình đăng ký: " + e.getMessage()));
        }
    }

    /**
     * API ĐĂNG NHẬP cho tài khoản Admin.
     * Xác thực dựa trên thông tin cấu hình, không dùng DB.
     */
    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse> loginAdmin(@RequestBody LoginRequest request) {
        // Bước 1: So sánh thông tin đăng nhập với giá trị đã cấu hình.
        // Đây là bước xác thực DUY NHẤT cho admin.
        if (adminEmail.equals(request.getEmail()) && adminPassword.equals(request.getPassword())) {

            // Bước 2: Tạo token trực tiếp.
            // KHÔNG gọi authenticationManager.authenticate()
            // KHÔNG gọi userRepository.findByEmail()
            // Chúng ta cần một phương thức trong JwtService có thể tạo token từ thông tin cơ bản.
            // Ví dụ: createToken(String userId, List<String> roles)
            String token = jwtService.createToken("admin", List.of("ROLE_ADMIN"));

            // Bước 3: Tạo một đối tượng User "ảo" để trả về trong response cho nhất quán.
            User adminUser = new User();
            adminUser.setId("admin");
            adminUser.setFullName("Administrator");
            adminUser.setEmail(adminEmail);
            adminUser.setRole(Role.ADMIN);
            // Bước 4: Xây dựng và trả về response thành công.
            AuthResponse authResponse = new AuthResponse(token, adminUser);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập admin thành công", authResponse));

        } else {
            // Nếu thông tin không khớp, trả về lỗi.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Sai tài khoản hoặc mật khẩu"));
        }
    }

    /**
     * API ĐĂNG NHẬP cho tài khoản Sinh viên.
     * Xác thực bằng email và password đã đăng ký.
     */
    @PostMapping("/user/login")
    public ResponseEntity<ApiResponse> loginStudent(@RequestBody LoginRequest request) {
        try {
            // 1. Spring Security xử lý việc xác thực
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // 2. Nếu xác thực thành công, lấy thông tin user từ DB
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));

            // 3. Tạo token
//            String token = jwtService.generateToken(user.getId(), user.getRole().name()); // Giả sử generateToken nhận userId và role
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            // 4. Xây dựng response
            AuthResponse authResponse = new AuthResponse(token, user);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));

        } catch (Exception e) {
            // Nếu authenticationManager ném ra lỗi (sai pass, user không tồn tại)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Sai tài khoản hoặc mật khẩu"));
        }
    }
}

