"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

interface Todo {
  id: number
  text: string
  completed: boolean
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }])
      setInput("")
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <Card className="p-6 glass">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todo List</h2>

        <form onSubmit={addTodo} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2 p-2 rounded-lg glass-hover group"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}