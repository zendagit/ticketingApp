<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Which attributes can be mass assigned
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
    ];

    // Hide sensitive attributes from JSON
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Type casting for attributes
    protected $casts = [
        'id' => 'integer',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Tickets this user created (admins).
     */
    public function createdTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'created_by');
    }

    /**
     * Tickets assigned to this user (employees).
     */
    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    /**
     * Quick role checks.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }
}
