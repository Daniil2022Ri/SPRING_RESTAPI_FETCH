package ru.kata.spring.boot_security.demo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String rawPassword = "user"; // заменить на свой пароль
        String encodedPassword = encoder.encode(rawPassword);

        System.out.println("Raw password: " + rawPassword);
        System.out.println("Encoded password: " + encodedPassword);

        // Проверка пароля
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Password matches: " + matches);
    }

}
