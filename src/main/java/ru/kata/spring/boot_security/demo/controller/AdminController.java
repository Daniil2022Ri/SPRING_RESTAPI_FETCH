package ru.kata.spring.boot_security.demo.controller;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;


@Controller
@AllArgsConstructor
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @GetMapping("/admin")
    public String adminPage() {
        return "admin";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    /*
    @GetMapping("/admin")
    public String viewHomePage(Model model, Principal principal) {
        List<User> users = userService.listAll();
        User admin = userService.getUserByEmail(principal.getName());
        model.addAttribute("users", users);
        model.addAttribute("email", admin.getEmail());
        model.addAttribute("role", admin.getAllRolesString());
        model.addAttribute("roles",roleService.getAllRoles());
        model.addAttribute("user", new User());
        model.addAttribute("userData", userService.getUserByEmail(principal.getName()));

        return "admin";
    }

    @GetMapping("/create")
    public String showNewUserPage(Model model) {
        User user = new User();
        model.addAttribute("user", user);
        return "new_user";
    }

    @PostMapping("/newUser")
    public String createNewUser(@RequestParam String username,
                           @RequestParam String lastName,
                           @RequestParam int age,
                           @RequestParam String email ,
                           @RequestParam String password ,
                           @RequestParam Set<Role> roles
    ) {
            userService.createUser(username , lastName ,age , email , password , roles);
        return "redirect:/admin";
    }
    @PostMapping("/edit")
    public String updateUser(User user){
        userService.updateUser(user);
        return "redirect:/admin";
    }

    @RequestMapping("/delete/{id}")
    public String deleteUser(@PathVariable(name = "id")Long id){
        userService.delete(id);
        return "redirect:/admin";
    }

    @ExceptionHandler(Exception.class)
    public ModelAndView handleError(HttpServletRequest req, Exception ex) {
        ModelAndView mav = new ModelAndView();
        mav.addObject("exception", ex);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName("error");
        return mav;
    }

 */
}
