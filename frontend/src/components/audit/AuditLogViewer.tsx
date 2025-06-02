import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/audit/logs');
        setLogs(response.data);
      } catch (err) {
        setError('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading audit logs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Audit Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.action}</td>
              <td>{log.user}</td>
              <td>{log.timestamp}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 