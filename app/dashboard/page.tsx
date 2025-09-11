"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { taskApi } from "@/lib/api"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, MoreHorizontal, LogOut, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  createdAt: string
  updatedAt: string
}

interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  })

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [statusFilter])

  const fetchTasks = async () => {
    try {
      const params: any = {}
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await taskApi.getTasks(params)
      console.log("[DEBUG] Fetch tasks response:", response.data)
      
      const tasks = response.data?.tasks || response.data?.data?.tasks || []
      console.log("[DEBUG] Parsed tasks:", tasks)
      
      setTasks(tasks)
    } catch (error) {
      console.log("[v0] Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await taskApi.getStats()
      setStats(response.data)
    } catch (error) {
      console.log("[v0] Error fetching stats:", error)
      setStats({ total: 0, pending: 0, inProgress: 0, completed: 0 })
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required")
      return
    }

    try {
      const response = await taskApi.createTask({
        ...newTask,
        status: "pending",
      })
      console.log("[DEBUG] Create task response:", response.data)
      
      const createdTask = response.data?.task || response.data?.data?.task
      
      if (!createdTask) {
        console.error("[ERROR] Task not found in response:", response.data)
        throw new Error("Task not returned from server")
      }
      
      setTasks([createdTask, ...tasks])
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" })
      setShowCreateForm(false)
      toast.success("Task created successfully!")
      fetchStats()
    } catch (error) {
      console.log("[v0] Error creating task:", error)
      toast.error("Failed to create task. Please check if the backend server is running.")
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await taskApi.updateTask(taskId, { status })
      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status } : task)))
      toast.success("Task updated successfully!")
      fetchStats()
    } catch (error) {
      console.log("[v0] Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId)
      setTasks(tasks.filter((task) => task._id !== taskId))
      toast.success("Task deleted successfully!")
      fetchStats()
    } catch (error) {
      console.log("[v0] Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">TaskFlow</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </header>

        <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchTasks()}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Input
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="flex gap-4">
                <Select
                  value={newTask.priority}
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createTask}>Create Task</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first task to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            tasks.filter(task => task && task._id && task.title).map((task) => (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge className={getStatusColor(task.status || 'pending')}>{(task.status || 'pending').replace("-", " ")}</Badge>
                        <Badge className={getPriorityColor(task.priority || 'medium')}>{task.priority || 'medium'}</Badge>
                      </div>

                      {task.description && <p className="text-muted-foreground mb-3">{task.description}</p>}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        {task.createdAt && <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {task.status !== "pending" && (
                          <DropdownMenuItem onClick={() => updateTaskStatus(task._id, "pending")}>
                            Mark as Pending
                          </DropdownMenuItem>
                        )}
                        {task.status !== "in-progress" && (
                          <DropdownMenuItem onClick={() => updateTaskStatus(task._id, "in-progress")}>
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {task.status !== "completed" && (
                          <DropdownMenuItem onClick={() => updateTaskStatus(task._id, "completed")}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteTask(task._id)} className="text-destructive">
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
