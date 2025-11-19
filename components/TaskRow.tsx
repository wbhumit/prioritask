import React, { useState } from 'react';
import { Task, Priority, Complexity, SubTask } from '../types';
import { PRIORITY_CONFIG, COMPLEXITY_CONFIG } from '../constants';
import { ChevronRight, ChevronDown, Check, Trash2, Sparkles, Plus, GripVertical } from 'lucide-react';
import { generateSubtasksAI } from '../services/geminiService';

interface TaskRowProps {
  task: Task;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onToggleExpand,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onToggleTaskComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const complexityConfig = COMPLEXITY_CONFIG[task.complexity];
  
  // Calculate completion
  const hasSubtasks = task.subtasks.length > 0;
  const allSubtasksComplete = hasSubtasks && task.subtasks.every(st => st.isCompleted);
  
  // The visual state of the main checkbox
  // If subtasks exist: it reflects 'allSubtasksComplete'
  // If no subtasks: it reflects a virtual completion state (handled by parent usually, 
  // but here we might assume a property on task or just use a single subtask logic.
  // Per user request: "If there are no sub-tasks added, the name of the task will be the default."
  // This suggests we treat the task itself as the checkable item if empty.
  // However, the data model separates subtasks. 
  // Strategy: If 0 subtasks, we show a checkbox that creates a 'self' subtask or toggles a task-level 'completed' flag.
  // To keep it simple and strictly follow: "Complete when all subtasks are complete",
  // we will treat an empty list as Incomplete until the user clicks the check, which effectively toggles a "done" state.
  // But wait, if subtasks > 0, clicking check should be disabled? Or check all? 
  // Let's make the main checkbox Read-Only if subtasks > 0, and Interactive if subtasks == 0.

  const isTaskvisuallyComplete = hasSubtasks ? allSubtasksComplete : (task.subtasks.length === 0 && (task as any)._selfCompleted); // We need a local state or prop for self-completion if no subtasks.
  // Actually, let's use a clever trick: 
  // If 0 subtasks, we assume the task acts as its own single item. We'll pass this click up to 'onToggleTaskComplete'.

  const handleGenerateSubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const suggestions = await generateSubtasksAI(task.title, complexityConfig.label);
      suggestions.forEach(s => onAddSubtask(task.id, s));
      if (!task.isExpanded) onToggleExpand(task.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className={`mb-3 group transition-all duration-300 ease-in-out ${isTaskvisuallyComplete ? 'opacity-60' : 'opacity-100'}`}>
      {/* Main Task Card */}
      <div 
        onClick={() => onToggleExpand(task.id)}
        className={`
          relative flex items-center bg-white border rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all
          ${task.isExpanded ? 'rounded-b-none border-b-0 z-10 ring-1 ring-indigo-500/20' : 'border-slate-200'}
          ${isTaskvisuallyComplete ? 'bg-slate-50' : ''}
        `}
      >
        {/* Decoration Bar for Priority */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${priorityConfig.color.replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[0]}`}></div>

        {/* Checkbox Area */}
        <div className="pl-4 pr-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleTaskComplete(task.id)}
            disabled={hasSubtasks} // If it has subtasks, you must complete them individually
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${isTaskvisuallyComplete 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : hasSubtasks 
                  ? 'border-slate-300 bg-slate-100 cursor-default' 
                  : 'border-slate-300 hover:border-emerald-400 text-transparent'
              }
            `}
          >
            <Check className={`w-3.5 h-3.5 ${isTaskvisuallyComplete ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-grow min-w-0 pr-4">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`font-medium text-base truncate ${isTaskvisuallyComplete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
              {task.title}
            </h3>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">
              • {task.subtasks.filter(t => t.isCompleted).length}/{task.subtasks.length} steps
            </span>
          </div>
          <div className="flex gap-2 text-xs">
             {/* Mobile Badge view */}
             <span className={`sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityConfig.color}`}>
               {task.priority}
             </span>
             <span className={`sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${complexityConfig.color}`}>
               {complexityConfig.short}
             </span>
          </div>
        </div>

        {/* Columns (Hidden on mobile, shown on MD+) */}
        <div className="hidden sm:flex items-center gap-8 mr-8">
           {/* Complexity Column */}
           <div className="w-24 flex flex-col items-start">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Complexity</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${complexityConfig.color}`}>
                {complexityConfig.label}
              </span>
           </div>
           
           {/* Priority Column */}
           <div className="w-24 flex flex-col items-start">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Priority</span>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                  <priorityConfig.icon className="w-3 h-3 mr-1" />
                  {priorityConfig.label}
                </span>
              </div>
           </div>
        </div>

        {/* Action / Expand Icon */}
        <div className="flex items-center gap-2 text-slate-400">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className={`transform transition-transform duration-300 ${task.isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subtasks Accordion */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out border-x border-b rounded-b-xl border-slate-200 bg-slate-50/50
          ${task.isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-none'}
        `}
      >
        <div className="p-4 pl-[3.25rem]"> {/* Indented to align with text */}
          
          {/* AI Generator Button if empty */}
          {task.subtasks.length === 0 && !isTaskvisuallyComplete && (
             <div className="mb-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100 border-dashed">
                <span className="text-sm text-indigo-700">No subtasks yet. Break it down?</span>
                <button 
                  onClick={handleGenerateSubtasks}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 text-xs font-medium rounded-md border border-indigo-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all"
                >
                  {isGenerating ? (
                    <span className="animate-pulse">Thinking...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Suggestions</span>
                    </>
                  )}
                </button>
             </div>
          )}

          {/* Subtask List */}
          <ul className="space-y-2 mb-3">
            {task.subtasks.map((subtask) => (
              <li 
                key={subtask.id}
                onClick={() => onToggleSubtask(task.id, subtask.id)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors group/sub
                  ${subtask.isCompleted ? 'text-slate-400' : 'text-slate-700'}
                `}
              >
                 <div className={`
                   w-4 h-4 rounded border flex items-center justify-center transition-all
                   ${subtask.isCompleted ? 'bg-slate-400 border-slate-400' : 'border-slate-300 bg-white group-hover/sub:border-indigo-400'}
                 `}>
                   <Check className={`w-3 h-3 text-white ${subtask.isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                 </div>
                 <span className={`text-sm ${subtask.isCompleted ? 'line-through' : ''}`}>
                   {subtask.title}
                 </span>
              </li>
            ))}
          </ul>

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSubtaskSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Plus className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a subtask..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-slate-400"
            />
          </form>
        </div>
      </div>
    </div>
  );
};