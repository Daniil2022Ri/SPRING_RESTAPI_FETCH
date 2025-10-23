$(document).ready(function () {
    // API Object
    const userApi = {
        getAllUsers: async () => {
            try {
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('Error fetching users:', error);
                throw error;
            }
        },

        getUserById: async (id) => {
            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('Error fetching user:', error);
                throw error;
            }
        },

        getCurrentUser: async () => {
            try {
                const response = await fetch('/api/current-user', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('Error fetching current user:', error);
                throw error;
            }
        },

        createUser: async (userData) => {
            try {
                console.log('Creating user:', userData);
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Server error response:', errorData);
                    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        },

        updateUser: async (userData) => {
            try {
                console.log('Updating user:', userData);
                const response = await fetch('/api/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Server error response:', errorData);
                    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error updating user:', error);
                throw error;
            }
        },

        deleteUser: async (id) => {
            try {
                console.log('Deleting user ID:', id);
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return true;
            } catch (error) {
                console.error('Error deleting user:', error);
                throw error;
            }
        }
    };

    // Show Alert
    function showAlert(container, message, type = 'success') {
        const alert = `
            <div class="alert alert-${type} alert-dismissible fade show col-12" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;
        container.prepend(alert);
        setTimeout(() => $('.alert').alert('close'), 3000);
    }

    // Fill Admin Table
    async function fillAdminTable() {
        try {
            const users = await userApi.getAllUsers();
            console.log('Users fetched:', users); // Debug
            const tbody = $('#users_home_table');
            tbody.empty();
            users.forEach(user => {
                const roles = user.roles && Array.isArray(user.roles)
                    ? user.roles.map(role => role.name ? role.name.replace('ROLE_', '') : 'N/A').join(', ')
                    : 'N/A';
                console.log(`User ${user.username} roles:`, user.roles); // Debug
                const row = `
                    <tr>
                        <td>${user.id || 'N/A'}</td>
                        <td>${user.username || 'N/A'}</td>
                        <td>${user.lastName || 'N/A'}</td>
                        <td>${user.age || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${roles}</td>
                        <td><button class="btn btn-primary btn-sm edit-user" data-id="${user.id}">Edit</button></td>
                        <td><button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Delete</button></td>
                    </tr>`;
                tbody.append(row);
            });
        } catch (error) {
            console.error('Error in fillAdminTable:', error);
            showAlert($('#adminTable'), 'Failed to load users: ' + error.message, 'danger');
        }
    }

    // Fill User Table
    async function fillUserTable() {
        try {
            const user = await userApi.getCurrentUser();
            console.log('Current user fetched:', user);
            const tbody = $('#tableUser tbody');
            tbody.empty();
            if (!user) {
                showAlert($('#userTable'), 'No user data available', 'danger');
                return;
            }
            const roles = user.roles && Array.isArray(user.roles)
                ? user.roles.map(role => role.name ? role.name.replace('ROLE_', '') : 'N/A').join(', ')
                : 'N/A';
            const row = `
                <tr>
                    <td>${user.id || 'N/A'}</td>
                    <td>${user.username || 'N/A'}</td>
                    <td>${user.lastName || 'N/A'}</td>
                    <td>${user.age || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${roles}</td>
                </tr>`;
            tbody.append(row);
        } catch (error) {
            console.error('Error in fillUserTable:', error);
            showAlert($('#userTable'), 'Failed to load user data: ' + error.message, 'danger');
        }
    }

    // Fill Edit Modal
    async function fillEditModal(userId) {
        try {
            const user = await userApi.getUserById(userId);
            console.log('User for edit:', user);
            const form = $('#editUserForm');
            form.find('#id').val(user.id || '');
            form.find('#username').val(user.username || '');
            form.find('#lastName').val(user.lastName || '');
            form.find('#age').val(user.age || '');
            form.find('#email').val(user.email || '');
            form.find('#password').val('');
            const roleValues = user.roles && Array.isArray(user.roles)
                ? user.roles.map(role => role.name || '')
                : [];
            console.log('Edit modal roles:', roleValues); // Debug
            form.find('#roles').val(roleValues);
            $('#editUserModal').modal('show');
        } catch (error) {
            console.error('Error in fillEditModal:', error);
            showAlert($('#adminTable'), 'Failed to load user data: ' + error.message, 'danger');
        }
    }

    // Create User
    function handleCreateUser() {
        $('#addForm').on('submit', async (event) => {
            event.preventDefault();
            const form = $('#addForm');
            const selectedRoles = Array.from(form.find('#rolesCreate option:selected')).map(option => option.value);
            console.log('Selected roles:', selectedRoles); // Debug
            const userData = {
                username: form.find('#usernameCreate').val().trim(),
                password: form.find('#passwordCreate').val().trim(),
                lastName: form.find('#surnameCreate').val().trim(),
                age: parseInt(form.find('#ageCreate').val()),
                email: form.find('#emailCreate').val().trim(),
                roles: selectedRoles.map(role => ({ name: role }))
            };

            console.log('User data to send:', userData);

            if (!userData.username || !userData.password || !userData.lastName || isNaN(userData.age) || !userData.email || !userData.roles.length) {
                showAlert(form, 'Please fill in all required fields', 'danger');
                return;
            }

            try {
                await userApi.createUser(userData);
                form.find('input').val('');
                form.find('#rolesCreate').val([]);
                showAlert(form, 'User created successfully!', 'success');
                await fillAdminTable();
                $('.nav-tabs a[href="#adminTable"]').tab('show');
            } catch (error) {
                console.error('Create user error:', error);
                showAlert(form, error.message, 'danger');
            }
        });
    }

    // Update User
    function handleUpdateUser() {
        $('#editUserSubmit').on('click', async () => {
            const form = $('#editUserForm');
            const selectedRoles = Array.from(form.find('#roles option:selected')).map(option => option.value);
            console.log('Selected roles for update:', selectedRoles);
            const userData = {
                id: parseInt(form.find('#id').val()),
                username: form.find('#username').val().trim(),
                lastName: form.find('#lastName').val().trim(),
                age: parseInt(form.find('#age').val()),
                email: form.find('#email').val().trim(),
                password: form.find('#password').val().trim() || null,
                roles: selectedRoles.map(role => ({ name: role }))
            };

            if (!userData.username || !userData.lastName || isNaN(userData.age) || !userData.email || !userData.roles.length) {
                showAlert($('#editUserModal .modal-body'), 'Please fill in all required fields', 'danger');
                return;
            }

            try {
                await userApi.updateUser(userData);
                $('#editUserModal').modal('hide');
                showAlert($('#adminTable'), 'User updated successfully!', 'success');
                await fillAdminTable();
            } catch (error) {
                console.error('Update user error:', error);
                showAlert($('#editUserModal .modal-body'), error.message, 'danger');
            }
        });
    }

    // Delete User
    function handleDeleteUser() {
        $('#users_home_table').on('click', '.delete-user', async function () {
            const userId = $(this).data('id');
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    await userApi.deleteUser(userId);
                    showAlert($('#adminTable'), 'User deleted successfully!', 'success');
                    await fillAdminTable();
                } catch (error) {
                    console.error('Delete user error:', error);
                    showAlert($('#adminTable'), error.message, 'danger');
                }
            }
        });
    }

    // Edit User Handler
    function handleEditUser() {
        $('#users_home_table').on('click', '.edit-user', async function () {
            const userId = $(this).data('id');
            await fillEditModal(userId);
        });
    }

    // Initialization
    async function init() {
        try {
            await fillAdminTable();
            await fillUserTable();
            handleCreateUser();
            handleUpdateUser();
            handleDeleteUser();
            handleEditUser();
            $('a[href="#adminTable"]').on('shown.bs.tab', fillAdminTable);
            $('a[href="#userTable"]').on('shown.bs.tab', fillUserTable);
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    init();
});