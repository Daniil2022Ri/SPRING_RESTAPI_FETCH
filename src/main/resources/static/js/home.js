$(document).ready(function () {
    const apiBase = '/api';
    const csrfToken = $('meta[name="_csrf"]').attr('content');
    const csrfHeader = $('meta[name="_csrf_header"]').attr('content');

    // Универсальный fetch с CSRF
    async function apiFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (csrfToken && csrfHeader && ['POST', 'PUT', 'DELETE'].includes(options.method || '')) {
            headers[csrfHeader] = csrfToken;
        }
        return fetch(url, { ...options, headers });
    }

    // Уведомления
    function showAlert(container, message, type = 'success') {
        const alert = $(`<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert">&times;</button>
        </div>`);
        container.prepend(alert);
        setTimeout(() => alert.alert('close'), 5000);
    }

    // Загрузка всех пользователей
    async function loadAllUsers() {
        try {
            $('#tableAllUsers').addClass('loading');
            const response = await apiFetch(`${apiBase}/users`);
            if (!response.ok) throw new Error('Failed to load users');
            const users = await response.json();
            const tbody = $('#users-table-rows');
            tbody.empty();
            users.forEach(user => {
                const roles = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
                tbody.append(`
                    <tr data-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.lastName}</td>
                        <td>${user.age}</td>
                        <td>${user.email}</td>
                        <td>${roles}</td>
                        <td><button class="btn btn-info btn-sm edit-btn">Edit</button></td>
                        <td><button class="btn btn-danger btn-sm delete-btn">Delete</button></td>
                    </tr>
                `);
            });
        } catch (error) {
            showAlert($('#nav-users_table'), error.message, 'danger');
        } finally {
            $('#tableAllUsers').removeClass('loading');
        }
    }

    // Загрузка текущего пользователя (с защитой от 401)
    async function loadCurrentUser() {
        // Если нет CSRF — пользователь не залогинен
        if (!csrfToken) {
            $('#user-table-rows').html('<tr><td colspan="6" class="text-center text-muted">Please log in to view your profile.</td></tr>');
            return;
        }

        try {
            $('#tableUser').addClass('loading');
            const response = await apiFetch(`${apiBase}/current-user`);

            if (response.status === 401) {
                $('#user-table-rows').html('<tr><td colspan="6" class="text-center text-muted">Session expired. Please log in again.</td></tr>');
                return;
            }

            if (!response.ok) throw new Error('Failed to load current user');

            const user = await response.json();
            const tbody = $('#user-table-rows');
            tbody.empty();
            const roles = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
            tbody.append(`
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${roles}</td>
                </tr>
            `);
        } catch (error) {
            showAlert($('#user-area'), error.message, 'danger');
        } finally {
            $('#tableUser').removeClass('loading');
        }
    }

    // Загрузка ролей в <select>
    async function loadRoles(selectId, selected = []) {
        try {
            const response = await apiFetch(`${apiBase}/roles`);
            if (!response.ok) throw new Error('Failed to load roles');
            const roles = await response.json();
            const select = $(selectId);
            select.empty();
            roles.forEach(role => {
                const isSelected = selected.some(s => s.id === role.id);
                select.append(`<option value="${role.id}" ${isSelected ? 'selected' : ''}>${role.name.replace('ROLE_', '')}</option>`);
            });
        } catch (error) {
            $(selectId).html('<option value="2">USER</option><option value="1">ADMIN</option>');
        }
    }

    // Открытие модалки Edit/Delete
    async function openModal(id, isEdit) {
        try {
            const response = await apiFetch(`${apiBase}/users/${id}`);
            if (!response.ok) throw new Error('User not found');
            const user = await response.json();

            $('#id').val(user.id);
            $('#username').val(user.username);
            $('#lastName').val(user.lastName);
            $('#age').val(user.age);
            $('#email').val(user.email);
            $('#password').val('');
            await loadRoles('#roles', user.roles);

            const submitBtn = $('.submit');
            if (isEdit) {
                $('.modal-title').text('Edit user');
                submitBtn.text('Update').removeClass('btn-danger').addClass('btn-primary');
                $('#password-div').show();

                // *** ИСПРАВЛЕНИЕ: Разблокируем поля для редактирования ***
                $('#user-profile-form input:not(#id)').prop('readonly', false);
                $('#user-profile-form select').prop('disabled', false);

            } else {
                $('.modal-title').text('Delete user');
                submitBtn.text('Delete').removeClass('btn-primary').addClass('btn-danger');
                $('#password-div').hide();

                // Блокируем поля для просмотра (delete)
                $('#user-profile-form input:not(#id)').prop('readonly', true);
                $('#user-profile-form select').prop('disabled', true);
            }
            $('#user-profile').modal('show');
        } catch (error) {
            showAlert($('#nav-users_table'), error.message, 'danger');
        }
    }

    // === ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ===
    $('#user-addform').on('submit', async function (e) {
        e.preventDefault();
        const data = {
            username: $('#newUsername').val(),
            lastName: $('#newlastName').val(),
            age: parseInt($('#newage').val()),
            email: $('#newemail').val(),
            password: $('#newpassword').val(),
            roleIds: Array.from($('#newroles option:selected')).map(opt => parseInt(opt.value))
        };

        try {
            const response = await apiFetch(`${apiBase}/users`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add user');
            }
            this.reset();
            showAlert($(this), 'User added successfully!', 'success');
            await loadAllUsers();
            $('#nav-users_table-link').click();
        } catch (error) {
            showAlert($(this), error.message, 'danger');
        }
    });

    // === РЕДАКТИРОВАНИЕ / УДАЛЕНИЕ ===
    $('.submit').on('click', async function () {
        const id = $('#id').val();

        if ($(this).hasClass('btn-danger')) {
            // УДАЛЕНИЕ
            try {
                const response = await apiFetch(`${apiBase}/users/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                $('#user-profile').modal('hide');
                showAlert($('#nav-users_table'), 'User deleted', 'success');
                await loadAllUsers();
            } catch (error) {
                showAlert($('#user-profile .modal-body'), error.message, 'danger');
            }
        } else {
            // ОБНОВЛЕНИЕ
            const data = {
                id: parseInt(id),
                username: $('#username').val(),
                lastName: $('#lastName').val(),
                age: parseInt($('#age').val()),
                email: $('#email').val(),
                password: $('#password').val() || null,
                roleIds: Array.from($('#roles option:selected')).map(opt => parseInt(opt.value))
            };

            try {
                const response = await apiFetch(`${apiBase}/users`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to update');
                }
                $('#user-profile').modal('hide');
                showAlert($('#nav-users_table'), 'User updated', 'success');
                await loadAllUsers();
            } catch (error) {
                showAlert($('#user-profile .modal-body'), error.message, 'danger');
            }
        }
    });

    // Кнопки
    $(document).on('click', '.edit-btn', function () {
        const id = $(this).closest('tr').data('id');
        openModal(id, true);
    });

    $(document).on('click', '.delete-btn', function () {
        const id = $(this).closest('tr').data('id');
        openModal(id, false);
    });

    // Табы
    $('#nav-users_table-link').on('click', loadAllUsers);
    $('#nav-user_form-link').on('click', () => loadRoles('#newroles'));
    $('#user-area-tab').on('click', loadCurrentUser);
    $('#admin-area-tab').on('click', loadAllUsers);

    // === ИНИЦИАЛИЗАЦИЯ ===
    // Загружаем только если есть CSRF (т.е. залогинен)
    if (csrfToken) {
        loadAllUsers();
        loadCurrentUser();
    } else {
        // Показываем только таблицу пользователей (если админ)
        $('#user-area').html('<div class="p-4 text-center text-muted">Log in to access the panel.</div>');
    }
});
//!!!!!ПОМОГИТЕ МНЕ ПОЖАЛУЙСТА