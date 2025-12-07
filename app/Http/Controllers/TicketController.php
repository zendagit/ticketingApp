<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\User;
use Exception;

class TicketController extends Controller
{
    /**
     * Create a ticket (Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            if (!empty($validated['assigned_to'])) {
                $assignee = User::find($validated['assigned_to']);
                if (!$assignee || $assignee->role !== 'employee') {
                    return response()->json(['status' => false, 'message' => 'Assigned user must be an employee'], 422);
                }
            }

            $ticket = Ticket::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'created_by' => $me->id,
                'assigned_to' => $validated['assigned_to'] ?? null,
                'status' => empty($validated['assigned_to']) ? 'open' : 'in_progress'
            ]);

            return response()->json(['status' => true, 'message' => 'Ticket created', 'ticket' => $ticket], 201);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to create ticket', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * List tickets (Admin only).
     * Optional query param: ?status=open|in_progress|completed
     */
    public function index(Request $request)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $status = $request->query('status');
            $q = Ticket::with(['creator:id,name,email','assignee:id,name,email']);

            if ($status) {
                $q->where('status', $status);
            }

            $tickets = $q->get();

            return response()->json(['status' => true, 'tickets' => $tickets]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to list tickets', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update ticket (Admin only).
     * Allows changing title, description, status, assigned_to.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:open,in_progress,completed',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $ticket = Ticket::find($id);
            if (!$ticket) {
                return response()->json(['status' => false, 'message' => 'Ticket not found'], 404);
            }

            // If assigned_to provided, make sure it's an employee
            if (array_key_exists('assigned_to', $validated) && !is_null($validated['assigned_to'])) {
                $assignee = User::find($validated['assigned_to']);
                if (!$assignee || $assignee->role !== 'employee') {
                    return response()->json(['status' => false, 'message' => 'Assigned user must be an employee'], 422);
                }
            }

            // Apply updates
            $ticket->fill($validated);
            // if assigned_to provided and not null, ensure status at least in_progress
            if (array_key_exists('assigned_to', $validated) && !is_null($validated['assigned_to'])) {
                $ticket->status = $ticket->status === 'completed' ? 'completed' : 'in_progress';
            }
            $ticket->save();

            return response()->json(['status' => true, 'message' => 'Ticket updated', 'ticket' => $ticket]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to update ticket', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Assign ticket to employee (Admin only).
     * Body: assigned_to (required user id)
     */
    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id'
        ]);

        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $ticket = Ticket::find($id);
            if (!$ticket) {
                return response()->json(['status' => false, 'message' => 'Ticket not found'], 404);
            }

            $assignee = User::find($validated['assigned_to']);
            if (!$assignee || $assignee->role !== 'employee') {
                return response()->json(['status' => false, 'message' => 'Assigned user must be an employee'], 422);
            }

            $ticket->assigned_to = $assignee->id;
            $ticket->status = $ticket->status === 'completed' ? 'completed' : 'in_progress';
            $ticket->save();

            return response()->json(['status' => true, 'message' => 'Ticket assigned', 'ticket' => $ticket]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to assign ticket', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete ticket (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $ticket = Ticket::find($id);
            if (!$ticket) {
                return response()->json(['status' => false, 'message' => 'Ticket not found'], 404);
            }

            $ticket->delete();

            return response()->json(['status' => true, 'message' => 'Ticket deleted']);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to delete ticket', 'details' => $e->getMessage()], 500);
        }
    }
}
