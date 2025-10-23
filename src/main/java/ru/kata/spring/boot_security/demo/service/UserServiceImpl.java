package ru.kata.spring.boot_security.demo.service;

import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.dto.RoleDTO;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import javax.annotation.PostConstruct;
import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void init() {
        Role adminRole = roleRepository.save(new Role(null, "ROLE_ADMIN"));
        Role userRole = roleRepository.save(new Role(null, "ROLE_USER"));

        userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin"))
                .lastName("Admin")
                .age(30)
                .email("admin@mail.com")
                .roles(Set.of(adminRole))
                .build());

        userRepository.save(User.builder()
                .username("user")
                .password(passwordEncoder.encode("user"))
                .lastName("User")
                .age(25)
                .email("user@mail.com")
                .roles(Set.of(userRole))
                .build());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    @Override
    public User createNewUserRest(User user, Set<Long> roleIds) {
        validateUser(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(resolveRolesById(roleIds));
        return userRepository.save(user);
    }

    @Transactional
    @Override
    public User updateUserRest(User user, Set<Long> roleIds) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!existing.getUsername().equals(user.getUsername()) &&
                userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        existing.setUsername(user.getUsername());
        existing.setLastName(user.getLastName());
        existing.setAge(user.getAge());
        existing.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        existing.setRoles(resolveRolesById(roleIds));
        return userRepository.save(existing);
    }

    private Set<Role> resolveRolesById(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            throw new RuntimeException("Roles are required");
        }
        Set<Role> roles = new HashSet<>();
        for (Long id : roleIds) {
            Role role = roleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + id));
            roles.add(role);
        }
        return roles;
    }

    @Override
    public List<User> getAllUsersRest() {
        return userRepository.findAll();
    }

    @Override
    public User get(Long id) {
        return userRepository.findById(id).orElse(null);
    }


    @Transactional
    @Override
    public void deleteUserRest(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public UserDTO convertToDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setLastName(user.getLastName());
        dto.setAge(user.getAge());
        dto.setEmail(user.getEmail());
        Hibernate.initialize(user.getRoles());
        dto.setRoles(user.getRoles().stream()
                .map(r -> {
                    RoleDTO rd = new RoleDTO();
                    rd.setId(r.getId());
                    rd.setName(r.getName());
                    return rd;
                })
                .collect(Collectors.toSet()));
        return dto;
    }


    @Override
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> {
                    RoleDTO dto = new RoleDTO();
                    dto.setId(r.getId());
                    dto.setName(r.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private void validateUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
    }

    private Set<Role> resolveRoles(Set<Role> roles) {
        Set<Role> valid = new HashSet<>();
        for (Role r : roles) {
            Role dbRole = roleRepository.findByName(r.getName())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + r.getName()));
            valid.add(dbRole);
        }
        return valid;
    }
}