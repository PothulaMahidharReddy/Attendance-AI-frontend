export const queryAttendance = async (baseUrl, query) => {
    const url = `${baseUrl.replace(/\/$/, '')}/query`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch attendance records');
    }

    return response.json();
};

export const fetchStatus = async (baseUrl) => {
    const url = `${baseUrl.replace(/\/$/, '')}/status`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Backend unreachable');
    }

    return response.json();
};
