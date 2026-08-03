package com.mysquad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record LoginRequest(
            @NotBlank
            @Pattern(regexp = "^[0-9]{10}$", message = "Valid 10-digit mobile number required")
            String phone,

            @NotBlank
            @Size(min = 4, max = 100)
            String password
    ) {}

    public record RegisterRequest(
            @NotBlank
            @Pattern(regexp = "^[0-9]{10}$")
            String phone,

            @NotBlank
            @Size(min = 4, max = 100)
            String password,

            @NotBlank
            String name
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String name,
            String phone,
            String role,
            boolean captain
    ) {}

    public record ChangePasswordRequest(
            @NotBlank
            @Size(min = 4, max = 100)
            String currentPassword,

            @NotBlank
            @Size(min = 4, max = 100)
            String newPassword
    ) {}
}