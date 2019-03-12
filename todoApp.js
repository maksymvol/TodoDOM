let editingTaskIndex = -1;
let currentListIndex = 0;

function setup() {
    if (!localStorage["tasks"]) {
        const list1 = [{item: "Some Todo", checked: true},
            {item: "Make Todo app", checked: false},
            {item: "Please let me rest", checked: false},
            {item: "Bring it new life", checked: false}];
        const list2 = [{item: "uughhh... Some boring info", checked: true}];
        const lists = [{list: list1, name: "work"}, {list: list2, name: "personal"}];
        localStorage["tasks"] = JSON.stringify(lists);
    }

    document.getElementById("task-input").onkeypress = function() {
        if (event.keyCode === 13) {
            addNewTask();
        }
    };

    const taskLists = document.getElementById('task-lists');
    for (let i = 0; i < taskLists.length; i++) {
        taskLists[i].addEventListener('click', function (element) {
            if (element.target.tagName === 'LI') {
                toggleCurrentList(element.target.id);
            }
        }, false);
    }

    const list = document.getElementById('tasks');
    for (let i = 0; i < list.length; i++) {
        list[i].addEventListener('click', function (element) {
            if (element.target.tagName === 'LI') {
                element.target.classList.toggle('checked');
            }
        }, false);
    }
    list.addEventListener('click', function (element) {
        if (element.target.tagName === 'LI') {
            element.target.classList.toggle('checked');
        }
    }, false);

    displayAllTasks();
    displayAllLists();
}

function toggleCurrentList(id) {
    console.log(id);
    currentListIndex = id;
    displayAllTasks();
}

function addNewTask() {
    const input = document.getElementById("task-input");

    if (input.value == "") {
        alert("Please type your task before adding it");
    } else {
        const task = {item: input.value, checked: false};
        const tasks = JSON.parse(localStorage["tasks"]);
        tasks[currentListIndex].list.push(task);
        localStorage["tasks"] = JSON.stringify(tasks);
        input.value = "";

        displayAllTasks();
    }
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage["tasks"]);
    tasks[currentListIndex].list.splice(index, 1);
    localStorage["tasks"] = JSON.stringify(tasks);
    displayAllTasks();
}

function editTask(index) {
    if (editingTaskIndex === -1) {
        editingTaskIndex = index;
    } else {
        if (editingTaskIndex === index) {
            return;
        }
        editingTaskIndex = index;
    }

    const nodeList = document.getElementsByTagName("LI");
    const childNodes = nodeList[index].childNodes;
    const input = document.createElement("INPUT");
    input.focus();
    input.onkeypress = function() {
        if (event.keyCode === 13) {
            const tasks = JSON.parse(localStorage["tasks"]);
            tasks[currentListIndex].list[index].item = this.value;
            localStorage["tasks"] = JSON.stringify(tasks);
            displayAllTasks();
        }
    };
    const tasks = JSON.parse(localStorage["tasks"]);
    input.innerText = tasks[currentListIndex].list[index].item;
    nodeList[index].removeChild(childNodes[0]);
    nodeList[index].appendChild(input);
}

function displayAllLists() {
    let container = document.getElementById("task-lists");
    container.innerHTML = "";
    const tasks = JSON.parse(localStorage["tasks"]);
    for (let i = 0; i < tasks.length; i++) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(tasks[i].name));
        container.appendChild(li);
    }
}

function displayAllTasks() {
    let container = document.getElementById("tasks");
    container.innerHTML = "";
    const tasks = JSON.parse(localStorage["tasks"]);

    for (let i = 0; i < tasks[currentListIndex].list.length; i++) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(tasks[currentListIndex].list[i].item));
        li.appendChild(createDeleteButton(i));
        li.appendChild(createEditButton(i));
        container.appendChild(li);
    }
}

function createDeleteButton(index) {
    const span = document.createElement("SPAN");
    span.className = "task-delete-button";
    span.appendChild(document.createTextNode("×"));
    span.onclick = function () {
        if (confirm("You really want to delete this task?")) {
            deleteTask(index);
        }
    };
    return span;
}

function createEditButton(index) {
    const i = document.createElement("i");
    i.className = "task-edit-button";
    i.appendChild(document.createTextNode("Edit"));
    i.onclick = function () {
        editTask(index);

    };
    return i;
}