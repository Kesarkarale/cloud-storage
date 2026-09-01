package com.example.demo.security;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(
            OAuth2UserRequest userRequest
    ) throws OAuth2AuthenticationException {

        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException(
                    "Google account email not available"
            );
        }

        if (!userRepository.existsByEmail(email)) {

            User newUser = new User();

            newUser.setName(
                    name != null ? name : "Google User"
            );

            newUser.setEmail(email);

            newUser.setPassword("GOOGLE_OAUTH_USER");

            newUser.setRole(Role.USER);

            userRepository.save(newUser);
        }

        return oauth2User;
    }
}