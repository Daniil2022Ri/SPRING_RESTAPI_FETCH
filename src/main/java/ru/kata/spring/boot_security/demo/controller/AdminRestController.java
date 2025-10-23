package ru.kata.spring.boot_security.demo.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dto.RoleDTO;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.validation.Valid;
import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class AdminRestController {

    private final UserService userService;

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequestDTO dto) {
        try {
            User user = new User();
            user.setUsername(dto.getUsername());
            user.setLastName(dto.getLastName());
            user.setAge(dto.getAge());
            user.setEmail(dto.getEmail());
            user.setPassword(dto.getPassword());
            user.setRoles(new HashSet<>());

            User created = userService.createNewUserRest(user, dto.getRoleIds());
            return ResponseEntity.ok(userService.convertToDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> dtos = userService.getAllUsersRest().stream()
                .map(userService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = userService.get(id);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userService.convertToDTO(user));
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        User user = userService.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        return ResponseEntity.ok(userService.convertToDTO(user));
    }

    @PutMapping("/users")
    public ResponseEntity<?> updateUser(@RequestBody UserRequestDTO dto) {
        try {
            User user = userService.get(dto.getId());
            if (user == null) return ResponseEntity.notFound().build();

            user.setUsername(dto.getUsername());
            user.setLastName(dto.getLastName());
            user.setAge(dto.getAge());
            user.setEmail(dto.getEmail());
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                user.setPassword(dto.getPassword());
            }

            User updated = userService.updateUserRest(user, dto.getRoleIds());
            return ResponseEntity.ok(userService.convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserRest(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error",  e.getMessage()));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }
}