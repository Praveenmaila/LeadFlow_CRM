package com.praveen.leadflow.user;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final DemoUserService userService;

    public UserController(DemoUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserSummaryResponse> list() {
        return userService.findAll().stream()
                .map(user -> new UserSummaryResponse(
                        user.uuid(),
                        user.email(),
                        user.fullName(),
                        user.role()))
                .toList();
    }
}
