<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Exception;

class EmployeeTicketController extends Controller
{
    /**
     * Employee: list tickets assigned to the authenticated user.
     */
    public function myTickets(Request $request)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isEmployee()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Employees only.'], 403);
            }

            $tickets = Ticket::where('assigned_to', $me->id)->get();
            return response()->json(['status' => true, 'tickets' => $tickets]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to fetch tickets', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Employee: mark an assigned ticket as completed.
     */
    public function markComplete(Request $request, $id)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isEmployee()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Employees only.'], 403);
            }

            $ticket = Ticket::where('id', $id)->where('assigned_to', $me->id)->first();
            if (!$ticket) {
                return response()->json(['status' => false, 'message' => 'Ticket not found or not assigned to you'], 404);
            }

            $ticket->status = 'completed';
            $ticket->save();

            return response()->json(['status' => true, 'message' => 'Ticket marked as completed', 'ticket' => $ticket]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to update ticket', 'details' => $e->getMessage()], 500);
        }
    }
}
