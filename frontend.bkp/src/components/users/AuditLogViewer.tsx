import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  created_at: string;
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    axios.get<AuditLog[]>('/api/audit/logs').then(res => setLogs(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Resource</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id}>
            <td>{log.action}</td>
            <td>{log.resource}</td>
            <td>{new Date(log.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
