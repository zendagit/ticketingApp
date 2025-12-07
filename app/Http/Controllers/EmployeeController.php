<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Exception;

class EmployeeController extends Controller
{
    // List all employees (admin only)
    public function index(Request $request)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $employees = User::where('role', 'employee')->get(['id','name','email','phone','created_at','updated_at']);
            return response()->json(['status' => true, 'employees' => $employees]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to fetch employees', 'details' => $e->getMessage()], 500);
        }
    }

    // View a single employee (admin only)
    public function show(Request $request, $id)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $employee = User::where('id', $id)->where('role', 'employee')->first();
            if (!$employee) {
                return response()->json(['status' => false, 'message' => 'Employee not found'], 404);
            }

            return response()->json(['status' => true, 'employee' => $employee]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to fetch employee', 'details' => $e->getMessage()], 500);
        }
    }

    // Delete an employee (admin only)
    public function destroy(Request $request, $id)
    {
        try {
            $me = $request->user();
            if (!$me || !$me->isAdmin()) {
                return response()->json(['status' => false, 'message' => 'Forbidden. Admins only.'], 403);
            }

            $employee = User::where('id', $id)->where('role', 'employee')->first();
            if (!$employee) {
                return response()->json(['status' => false, 'message' => 'Employee not found'], 404);
            }

            $employee->delete();

            return response()->json(['status' => true, 'message' => 'Employee deleted']);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'error' => 'Failed to delete employee', 'details' => $e->getMessage()], 500);
        }
    }
}
