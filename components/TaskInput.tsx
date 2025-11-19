import React, { useState } from 'react';
import { Priority, Complexity } from '../types';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAdd: (title: string, priority: Priority, complexity: Complexity) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.P1);
  const [complexity, setComplexity] = useState<Complexity>(Complexity.E);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, complexity);
    setTitle('');
    // We keep the priority/complexity settings for rapid entry of similar items, 
    // or we could reset them. Let's keep them for now.
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 transition-all focus-within:shadow-md">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow w-full">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Task Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="w-full md:w-auto flex gap-4">
          <div className="flex-1 md:w-32">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Complexity</label>
            <div className="relative">
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as Complexity)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 cursor-pointer"
              >
                <option value={Complexity.E}>Easy</option>
                <option value={Complexity.M}>Medium</option>
                <option value={Complexity.H}>Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 md:w-32">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 cursor-pointer"
              >
                <option value={Priority.P1}>P1 (Critical)</option>
                <option value={Priority.P2}>P2 (High)</option>
                <option value={Priority.P3}>P3 (Medium)</option>
                <option value={Priority.P4}>P4 (Low)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>
    </form>
  );
};