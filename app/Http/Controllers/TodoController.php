<?php

namespace App\Http\Controllers;

use App\Models\TodoItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TodoController extends Controller
{
    public function index()
    {
        $todos = TodoItem::where('user_id', auth()->id())
            ->orderBy('completed')
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Todos/Index', ['todos' => $todos]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'priority' => 'nullable|integer|min:1|max:5',
            'due_date' => 'nullable|date',
            'category' => 'nullable|string|max:50',
            'is_scheduled' => 'sometimes|boolean',
            'scheduled_day' => 'nullable|string|max:20',
            'scheduled_time' => 'nullable|string|max:5',
            'scheduled_duration' => 'nullable|integer|min:5|max:240',
        ]);

        $todo = TodoItem::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 3,
            'due_date' => $validated['due_date'] ?? null,
            'category' => $validated['category'] ?? null,
            'sort_order' => TodoItem::where('user_id', auth()->id())->max('sort_order') + 1,
            'is_scheduled' => $validated['is_scheduled'] ?? false,
            'scheduled_day' => $validated['scheduled_day'] ?? null,
            'scheduled_time' => $validated['scheduled_time'] ?? null,
            'scheduled_duration' => $validated['scheduled_duration'] ?? null,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $todo = TodoItem::where('user_id', auth()->id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'completed' => 'sometimes|boolean',
            'priority' => 'sometimes|integer|min:1|max:5',
            'due_date' => 'nullable|date',
            'category' => 'nullable|string|max:50',
            'sort_order' => 'sometimes|integer',
            'is_scheduled' => 'sometimes|boolean',
            'scheduled_day' => 'nullable|string|max:20',
            'scheduled_time' => 'nullable|string|max:5',
            'scheduled_duration' => 'nullable|integer|min:5|max:240',
        ]);

        $todo->update($validated);

        if (isset($validated['completed'])) {
            $todo->update(['completed_at' => $validated['completed'] ? now() : null]);
        }

        return redirect()->back();
    }

    public function destroy($id)
    {
        TodoItem::where('user_id', auth()->id())->findOrFail($id)->delete();
        return redirect()->back();
    }

    public function toggle($id)
    {
        $todo = TodoItem::where('user_id', auth()->id())->findOrFail($id);
        $todo->update([
            'completed' => !$todo->completed,
            'completed_at' => !$todo->completed ? now() : null,
        ]);
        return redirect()->back();
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            TodoItem::where('user_id', auth()->id())
                ->where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['ok' => true]);
    }

    public function stats()
    {
        $userId = auth()->id();
        $total = TodoItem::where('user_id', $userId)->count();
        $completed = TodoItem::where('user_id', $userId)->completed()->count();

        return response()->json([
            'total' => $total,
            'completed' => $completed,
            'pending' => $total - $completed,
            'percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
        ]);
    }
}
