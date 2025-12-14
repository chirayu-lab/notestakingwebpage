import { useState, useEffect } from 'react';
import { supabase, Note } from '../lib/supabase';
import { Plus, LogOut, Trash2, Edit2, Save, X } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const createNote = async () => {
    if (!newTitle.trim() && !newContent.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notes')
      .insert({
        title: newTitle,
        content: newContent,
        user_id: user.id,
      });

    if (!error) {
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
      fetchNotes();
    }
  };

  const updateNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .update({
        title: editTitle,
        content: editContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchNotes();
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchNotes();
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">My Notes</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} />
          New Note
        </button>

        {isCreating && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-2xl font-semibold text-slate-800 mb-4 outline-none border-b-2 border-transparent focus:border-blue-500 pb-2 transition"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full text-slate-600 outline-none resize-none min-h-[200px]"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={createNote}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle('');
                  setNewContent('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col"
            >
              {editingId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-semibold text-slate-800 mb-3 outline-none border-b-2 border-blue-500 pb-1"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-slate-600 flex-grow outline-none resize-none min-h-[150px] mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNote(note.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-slate-600 flex-grow mb-4 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => startEditing(note)}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {notes.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No notes yet. Create your first note to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
