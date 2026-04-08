import { useEffect, useState } from 'react';
import type { Task } from '../../services/taskService';
import { taskService } from "../../services/taskService";
import { storage } from "../../utils/storage.ts";
import { usePageTitle } from '../../hooks/usePageTitle';

const TasksPage = () => {
    usePageTitle('Tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getAll();
            setTasks(data);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const isSuperAdmin = storage.isSuperAdmin();

    const handleStatusUpdate = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE') => {
        try {
            await taskService.updateStatus(taskId, newStatus);
            // Refresh list after update
            loadTasks();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    if (loading) return <div className="p-6 text-gray-500 italic">Loading maintenance board...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Maintenance Board</h1>

            <div className="grid gap-4">
                {tasks.length === 0 ? (
                    <div className="p-10 border-2 border-dashed rounded-xl text-center text-gray-400">
                        No maintenance tasks found.
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="p-4 bg-white border rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-gray-900">{task.title}</h3>
                                <p className="text-sm text-gray-500">{task.description}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase">ID: {task.id.split('-')[0]}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {isSuperAdmin ? (
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value as any)}
                                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none cursor-pointer ${getStatusStyle(task.status)}`}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                ) : (
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusStyle(task.status)}`}>
                                        {task.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TasksPage;