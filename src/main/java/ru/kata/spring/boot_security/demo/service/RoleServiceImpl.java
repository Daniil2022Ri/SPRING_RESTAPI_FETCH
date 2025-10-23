package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.model.Role;

import java.util.List;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    @Autowired
    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    @Override
    public Role getRoleById(long id){
        return roleRepository.findById(id).get();
    }
    @Override
    public void deleteRole(long id) {
        roleRepository.deleteById(id);
    }
    @Override
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }
    @Override
    public Role updateRole(long id) {
        return roleRepository.save(roleRepository.getOne(id));
    }




}
