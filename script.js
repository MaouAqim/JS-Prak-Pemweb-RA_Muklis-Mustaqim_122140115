document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskPriorityInput = document.getElementById('taskPriority');
    const addTaskButton = document.getElementById('addTaskButton');
    const filterStatus = document.getElementById('filterStatus');
    const filterPriority = document.getElementById('filterPriority');
    const taskProgress = document.getElementById('taskProgress');
    const taskProgressText = document.getElementById('taskProgressText');
    const themeToggle = document.getElementById('themeToggle');
    const clearAllButton = document.getElementById('clearAllButton');
    const confirmClearAllButton = document.getElementById('confirmClearAllButton');
    const cancelClearAllButton = document.getElementById('cancelClearAllButton');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    const activeCountElement = document.getElementById('activeCount');
    const completedCountElement = document.getElementById('completedCount');

    let tasks = loadTasksFromLocalStorage();
    let taskToDeleteIndex = null;
    let taskToEditIndex = null;

    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const statusFilter = filterStatus.value;
        const priorityFilter = filterPriority.value;

        const filteredTasks = tasks.filter(task => {
            const matchesStatus = statusFilter === 'all' || 
                                  (statusFilter === 'completed' && task.completed) || 
                                  (statusFilter === 'notCompleted' && !task.completed);
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            return matchesStatus && matchesPriority;
        });

        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');

            if (task.completed) {
                taskItem.classList.add('completed');
            } else if (isTaskOverdue(task.dueDate)) {
                taskItem.classList.add('overdue');
            } else {
                taskItem.classList.add('pending');
            }

            const taskTitle = document.createElement('span');
            taskTitle.classList.add('task-title');
            taskTitle.textContent = task.title;

            const taskDueDate = document.createElement('span');
            taskDueDate.textContent = task.dueDate;

            const taskPriority = document.createElement('span');
            taskPriority.classList.add('task-priority');
            taskPriority.textContent = `Priority: ${task.priority}`;

            const taskActions = document.createElement('div');
            taskActions.classList.add('task-actions');

            const completeButton = document.createElement('button');
            completeButton.classList.add('complete-btn');
            completeButton.textContent = task.completed ? '✔️' : '✓';
            completeButton.onclick = () => toggleComplete(index);

            const editButton = document.createElement('button');
            editButton.classList.add('edit-btn');
            editButton.textContent = '✎';
            editButton.onclick = () => editTask(index);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = '✖';
            deleteButton.onclick = () => {
                taskToDeleteIndex = index;
                deleteModal.classList.add('show');
            };

            taskActions.appendChild(completeButton);
            taskActions.appendChild(editButton);
            taskActions.appendChild(deleteButton);

            taskItem.appendChild(taskTitle);
            taskItem.appendChild(taskDueDate);
            taskItem.appendChild(taskPriority);
            taskItem.appendChild(taskActions);

            taskList.appendChild(taskItem);
        });

        updateTaskCounts();
        updateProgressBar(filteredTasks);
        saveTasksToLocalStorage();
    }

    function addTask() {
        const title = taskTitleInput.value;
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;
        
        if (title && priority) {
            tasks.push({ title, dueDate, priority, completed: false });
            renderTasks();
            taskTitleInput.value = '';
            taskDueDateInput.value = '';
        }
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }

    function editTask(index) {
        const task = tasks[index];
        taskTitleInput.value = task.title;
        taskDueDateInput.value = task.dueDate;
        taskPriorityInput.value = task.priority;
        taskToEditIndex = index;
        addTaskButton.textContent = 'Update Task';
    }

    function updateTask() {
        const title = taskTitleInput.value;
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (taskToEditIndex !== null && title && priority) {
            tasks[taskToEditIndex] = { title, dueDate, priority, completed: false };
            renderTasks();
            taskTitleInput.value = '';
            taskDueDateInput.value = '';
            taskPriorityInput.value = 'low';
            taskToEditIndex = null;
            addTaskButton.textContent = 'Add Task';
        }
    }

    function deleteTask() {
        tasks.splice(taskToDeleteIndex, 1);
        renderTasks();
        deleteModal.classList.remove('show');
    }

    function clearAllTasks() {
        tasks = [];
        renderTasks();
    }

    function updateProgressBar(filteredTasks) {
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const totalTasks = filteredTasks.length;

        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        taskProgress.value = progressPercentage;
        taskProgressText.textContent = `${Math.round(progressPercentage)}%`;
    }

    function updateTaskCounts() {
        const completedTasks = tasks.filter(task => task.completed).length;
        const activeTasks = tasks.length - completedTasks;

        activeCountElement.textContent = `Active Tasks: ${activeTasks}`;
        completedCountElement.textContent = `Completed Tasks: ${completedTasks}`;
    }

    function isTaskOverdue(dueDate) {
        const today = new Date();
        const taskDueDate = new Date(dueDate);
        return taskDueDate < today && !isTaskCompleted(dueDate);
    }

    function isTaskCompleted(dueDate) {
        return tasks.some(task => task.dueDate === dueDate && task.completed);
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    clearAllButton.addEventListener('click', () => {
        document.getElementById('clearAllModal').classList.add('show');
    });

    confirmClearAllButton.addEventListener('click', () => {
        clearAllTasks();
        document.getElementById('clearAllModal').classList.remove('show');
    });

    cancelClearAllButton.addEventListener('click', () => {
        document.getElementById('clearAllModal').classList.remove('show');
    });

    confirmDeleteButton.addEventListener('click', deleteTask);
    cancelDeleteButton.addEventListener('click', () => {
        deleteModal.classList.remove('show');
    });

    addTaskButton.addEventListener('click', () => {
        if (taskToEditIndex === null) {
            addTask();
        } else {
            updateTask();
        }
    });

    filterStatus.addEventListener('change', () => renderTasks());
    filterPriority.addEventListener('change', () => renderTasks());

    renderTasks();
});
