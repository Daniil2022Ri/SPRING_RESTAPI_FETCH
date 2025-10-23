package ru.kata.spring.boot_security.demo.service;


import ru.kata.spring.boot_security.demo.dto.RoleDTO;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Set;


public interface UserService {

    User createNewUserRest(User user, Set<Long> roleIds);
    User updateUserRest(User user, Set<Long> roleIds);
    List<User> getAllUsersRest();
    User get(Long id);
    void deleteUserRest(Long id);
    User findByUsername(String username);
    UserDTO convertToDTO(User user);
    List<RoleDTO> getAllRoles();


}
