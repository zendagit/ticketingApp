<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Helpers\PasswordHelper;

class AuthController extends Controller
{
    // Register (admin or initial admin)
    public function register(Request $request)
    {
        // Validate first (do not let this exception be caught as a 500)
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,employee',
            'phone'    => 'nullable|string|max:30'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Use your custom helper (PBKDF2)
            $data['password'] = PasswordHelper::hashPassword($data['password']);

            $user = User::create($data);

            return response()->json([
                'status' => true,
                'message' => 'User registered successfully',
                'user' => $user
            ], 201);

        } catch (\Throwable $e) {
            // Only catch DB / unexpected issues here
            return response()->json([
                'status' => false,
                'error' => 'Registration failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            $user = User::where('email', $data['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Verify using custom helper
            if (!PasswordHelper::verifyPassword($data['password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $token = $user->createToken('api_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'error' => 'Login failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Logout
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Logged out'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'error' => 'Logout failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
