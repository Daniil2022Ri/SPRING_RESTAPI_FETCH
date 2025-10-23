package ru.kata.spring.boot_security.demo.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UserRequestDTO {
    private Long id;
    private String username;
    private String lastName;
    private int age;
    private String email;
    private String password;
    private Set<Long> roleIds;
}
