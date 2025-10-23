package ru.kata.spring.boot_security.demo.dto;

import lombok.Data;
import ru.kata.spring.boot_security.demo.model.Role;

import java.util.Set;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String lastName;
    private int age;
    private String email;
    private Set<RoleDTO> roles;

}
