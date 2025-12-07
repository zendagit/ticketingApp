<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeTicketController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Employee management
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    Route::post('/tickets', [TicketController::class, 'store']);

    // inside middleware('auth:sanctum') group:
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);

    // inside middleware('auth:sanctum') group:
    Route::get('/my-tickets', [EmployeeTicketController::class, 'myTickets']);
    Route::post('/my-tickets/{id}/complete', [EmployeeTicketController::class, 'markComplete']);
    });
