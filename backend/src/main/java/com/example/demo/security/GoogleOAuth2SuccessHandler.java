package com.example.demo.security;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class GoogleOAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public GoogleOAuth2SuccessHandler(
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User googleUser =
                (OAuth2User) authentication.getPrincipal();

        String email = googleUser.getAttribute("email");
        String name = googleUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Google account email not available"
            );
            return;
        }

        User user = userRepository
                .findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setId(UUID.randomUUID());
                    newUser.setName(
                            name != null && !name.isBlank()
                                    ? name
                                    : email
                    );
                    newUser.setEmail(email);

                    // Google users don't have a local password.
                    newUser.setPassword(
                            "{GOOGLE_OAUTH}"
                    );

                    newUser.setRole(Role.USER);

                    return userRepository.save(newUser);
                });

        String token = jwtService.generateToken(
                user.getEmail()
        );

        /*
         * Temporary frontend URL.
         * We will change this when the React/Vite frontend
         * is created.
         */
        String redirectUrl =
                "http://localhost:5173/oauth-success?token="
                        + token;

        getRedirectStrategy().sendRedirect(
                request,
                response,
                redirectUrl
        );
    }
}