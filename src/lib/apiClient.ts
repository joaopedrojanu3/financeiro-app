export function getAdminHeaders(): HeadersInit {
    if (typeof window === 'undefined') return {}

    const selectedUserId = localStorage.getItem('selected_custom_user_id')

    if (selectedUserId) {
        return {
            'x-selected-user-id': selectedUserId,
            'Content-Type': 'application/json'
        }
    }

    return {
        'Content-Type': 'application/json'
    }
}
