package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.dto.response.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "profile-client", url = "${profile.url}")
public interface ProfileClient {

    @GetMapping("/api/profiles/search")
    List<ProfileResponse> searchUsersByName(@RequestParam("name") String name, @RequestHeader("Authorization") String token);

    @GetMapping("/api/profiles/user/{userId}")
    ProfileResponse getUserById(@PathVariable("userId") String userId, @RequestHeader("Authorization") String token);
}
