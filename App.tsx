import React, { useState, useEffect, useMemo } from 'react';
import { Task, Priority, Complexity } from './types';
import { PRIORITY_WEIGHTS, COMPLEXITY_WEIGHTS } from './constants';
import { TaskInput } from './components/TaskInput';
import { TaskRow } from './components/TaskRow';
import { LayoutList, CheckCircle2, Download } from 'lucide-react';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial tasks for demo
const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Update Project Documentation',
    priority: Priority.P2,
    complexity: Complexity.E,
    subtasks: [
        { id: 'st1', title: 'Review current README', isCompleted: true },
        { id: 'st2', title: 'Add API endpoint details', isCompleted: false }
    ],
    isExpanded: false,
    createdAt: Date.now()
  },
  {
    id: 't2',
    title: 'Fix Critical Production Bug',
    priority: Priority.P1,
    complexity: Complexity.H,
    subtasks: [],
    isExpanded: false,
    createdAt: Date.now() - 1000
  },
  {
    id: 't3',
    title: 'Email Team Updates',
    priority: Priority.P1,
    complexity: Complexity.E,
    subtasks: [],
    isExpanded: false,
    createdAt: Date.now() - 2000
  }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  
  const handleAddTask = (title: string, priority: Priority, complexity: Complexity) => {
    const newTask: Task = {
      id: generateId(),
      title,
      priority,
      complexity,
      subtasks: [],
      isExpanded: false,
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleExpand = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isExpanded: !t.isExpanded } : t));
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: [...t.subtasks, { id: generateId(), title, isCompleted: false }],
      };
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st)
      };
    }));
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      
      if (t.subtasks.length > 0) {
         return t; 
      } else {
         const isCurrentlyDone = (t as any)._selfCompleted;
         return { ...t, _selfCompleted: !isCurrentlyDone };
      }
    }));
  };

  // Sorting Logic: P1+E is top.
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const pDiff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
      if (pDiff !== 0) return pDiff;
      const cDiff = COMPLEXITY_WEIGHTS[a.complexity] - COMPLEXITY_WEIGHTS[b.complexity];
      if (cDiff !== 0) return cDiff;
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => {
    if (t.subtasks.length > 0) return t.subtasks.every(st => st.isCompleted);
    return (t as any)._selfCompleted;
  }).length;

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 safe-top">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-sm">
              <LayoutList className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Prioritask</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}
            
            <div className="flex items-center gap-3">
               <div className="hidden sm:block text-xs font-medium text-slate-500">
                {completedTasks}/{totalTasks}
              </div>
              <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm font-bold text-indigo-600 w-8 text-right">{progress}%</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {deferredPrompt && (
             <div className="md:hidden mb-6 bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-sm">Install Prioritask</h3>
                   <p className="text-xs text-indigo-100 mt-0.5">Add to home screen for the best experience</p>
                </div>
                <button 
                  onClick={handleInstallClick}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
                >
                  Install
                </button>
             </div>
        )}

        <TaskInput onAdd={handleAddTask} />

        <div className="hidden sm:flex px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex-grow">Task</div>
          <div className="w-24 mr-8">Complexity</div>
          <div className="w-24 mr-8">Priority</div>
          <div className="w-10"></div>
        </div>

        <div className="space-y-1">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
              <p className="text-slate-500 mt-1">Add a new task to get started using the Quick Wins method.</p>
            </div>
          ) : (
            sortedTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onToggleExpand={handleToggleExpand}
                onDelete={handleDeleteTask}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
                onToggleTaskComplete={handleToggleTaskComplete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default App;