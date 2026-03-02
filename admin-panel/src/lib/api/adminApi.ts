const API_URL = '/api';

export const adminApi = {
    // We will share the existing /results/history endpoint to fetch data initially
    getResults: async () => {
        const res = await fetch(`${API_URL}/results/history`);
        if (!res.ok) throw new Error('Failed to fetch results');
        return res.json();
    },

    // Future endpoint for admin updates
    updateResult: async (id: string, data: any) => {
        const res = await fetch(`${API_URL}/admin/results/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update result');
        return res.json();
    },

    getUsers: async () => {
        // Mock data for phase 1
        return [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active' },
            { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'banned' },
        ];
    }
};
