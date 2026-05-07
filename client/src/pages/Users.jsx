import React from 'react';
import { Users, UserPlus } from 'lucide-react';

const UsersPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>User Management</h1>
        <button className="btn-primary"><UserPlus size={20} /> Add User</button>
      </div>
      <div className="card glass">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Admin</td>
              <td><span className="badge badge-confirmed">Admin</span></td>
              <td>01/01/2026</td>
              <td style={{ color: 'var(--success)' }}>Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
