<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    // Which fields can be mass assigned
    protected $fillable = [
        'title',
        'description',
        'status',
        'created_by',
        'assigned_to',
    ];

    // Casts for convenience
    protected $casts = [
        'id' => 'integer',
        'created_by' => 'integer',
        'assigned_to' => 'integer',
    ];

    /**
     * The admin who created the ticket.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The employee assigned to the ticket.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
