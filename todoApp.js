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

    document.getElementById("task-input").onkeypress = function (event) {
        if (event.key === "Enter") {
            addNewTask();
        }
    };

    //TASK LISTS MOUSE HANDLER
    const taskLists = document.getElementById('task-lists');
    taskLists.addEventListener('click', function (element) {
        if (element.target.tagName === 'LI') {
            element.target.classList.toggle('currentList');
            toggleCurrentList(element.target.innerHTML);
        }
    }, false);

    //TASKS LIST MOUSE HANDLER
    const list = document.getElementById('tasks');
    list.addEventListener('click', function (element) {
        if (element.target.tagName === 'LI') {
            element.target.classList.toggle('checked');
        }
    }, false);

    displayAllTasks();
    displayAllLists();
}

function toggleCurrentList(listName) {
    let newId = currentListIndex;
    const tasks = JSON.parse(localStorage["tasks"]);
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].name === listName) {
            newId = i;
            break;
        }
    }

    if (newId >= 0 && newId < tasks.length) {
        currentListIndex = newId;
        displayAllTasks();
        displayAllLists();
    }
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
    input.onkeypress = function (event) {
        if (event.key === "Enter") {
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

    //DISPLAY CURRENT LIST FLAG
    disableAllFlagsInUL("task-lists", "currentList");
    const taskLies = document.getElementById("task-lists");
    taskLies.childNodes[currentListIndex].classList.add("currentList");

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

    disableAllFlagsInUL("tasks", "checked");
    for (let i = 0; i < container.childNodes.length; i++) {
        if (tasks[currentListIndex].list[i].checked)
            container.childNodes[i].classList.add("checked");
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

function disableAllFlagsInUL(listId, toggleElementId) {
    const taskLies = document.getElementById(listId);
    for (let i = 0; i < taskLies.childNodes.length; i++) {
        if (currentListIndex === i) {
            taskLies.childNodes[i].classList.remove(toggleElementId);
        }
    }
}