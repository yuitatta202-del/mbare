// src/components/admin/UsersTab.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfileModal } from './UserProfileModal';

export function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:3001/api/super-admin/users', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`http://localhost:3001/api/super-admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ role: newRole })
    });
    fetchUsers();
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`http://localhost:3001/api/super-admin/users/${userId}/active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    fetchUsers();
  };

  if (loading) return <p className="text-mbare-muted font-mono text-center py-12">Caricando gli utenti...</p>;

  return (
    <>
      <div className="bg-mbare-surface border-2 border-mbare-border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-mbare-black border-b border-mbare-border">
            <tr>
              <th className="p-4 font-mono text-xs uppercase text-mbare-muted">Username</th>
              <th className="p-4 font-mono text-xs uppercase text-mbare-muted">Email</th>
              <th className="p-4 font-mono text-xs uppercase text-mbare-muted">Ruolo</th>
              <th className="p-4 font-mono text-xs uppercase text-mbare-muted">Stato</th>
              <th className="p-4 font-mono text-xs uppercase text-mbare-muted">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-mbare-border last:border-0 hover:bg-mbare-black/50 transition-colors">
                <td className="p-4 font-sans text-mbare-white">{u.username || 'N/A'}</td>
                <td className="p-4 font-mono text-sm text-mbare-muted">
                  <button onClick={() => setSelectedUser(u)} className="hover:text-mbare-accent underline decoration-1 underline-offset-2">
                    {u.email || 'N/A'}
                  </button>
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-mbare-black border border-mbare-border text-mbare-white p-2 font-mono text-xs outline-none focus:border-mbare-accent"
                  >
                    <option value="USER">USER</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`font-mono text-xs px-2 py-1 ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.isActive ? 'ATTIVO' : 'BANNATO'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(u.id, u.isActive)}
                    className={`font-mono text-xs uppercase px-3 py-1 border transition-all ${
                      u.isActive 
                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {u.isActive ? 'Banna' : 'Sblocca'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}