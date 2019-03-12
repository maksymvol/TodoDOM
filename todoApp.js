let currentListIndex = 0;
const baseURL = "http://localhost:3000";
let lists = [];
let tasks = [];

async function setup() {
    await getListsFromDB();
    await getTasksFromDB();
    if (!lists) {
        const list1 = [{item: "You can add new task: type it and press 'Add' button", checked: false},
            {item: "Click on task to complete it", checked: true},
            {item: "Delete task by pressing 'x' button on it", checked: false},
            {item: "Edit task -> click on 'Edit' button", checked: false}];
        const list2 = [{item: "uughhh... Some boring info", checked: true}];
        const lists = [{list: list1, name: "Tasks tutorial"}, {list: list2, name: "Personal"}];
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
            toggleCurrentList(element.target.firstChild.textContent);
        }
    }, false);

    //TASKS LIST MOUSE HANDLER
    const list = document.getElementById('tasks');
    list.addEventListener('click', function (element) {
        if (element.target.tagName === 'LI') {
            element.target.classList.toggle('checked');
            toggleTaskChecked(element.target.firstChild.textContent);
        }
    }, false);

    rerender();
}

function addNewList() {
    const input = document.getElementById("new-list-input");

    if (input.value == "") {
        alert("Please type list name before adding it");
    } else {
        const newList = {list: [], name: input.value};
        const tasks = JSON.parse(localStorage["tasks"]);
        tasks.push(newList);
        localStorage["tasks"] = JSON.stringify(tasks);
        input.value = "";

        rerender();
    }
}

function toggleTaskChecked(taskName) {
    let newId = -1;
    const tasks = JSON.parse(localStorage["tasks"]);
    for (let i = 0; i < tasks[currentListIndex].list.length; i++) {
        if (tasks[currentListIndex].list[i].item === taskName) {
            newId = i;
            break;
        }
    }
    tasks[currentListIndex].list[newId].checked = !tasks[currentListIndex].list[newId].checked;
    localStorage["tasks"] = JSON.stringify(tasks);
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
        rerender();
    }
}

function deleteList(index) {
    const tasks = JSON.parse(localStorage["tasks"]);
    tasks.splice(index, 1);
    localStorage["tasks"] = JSON.stringify(tasks);
    currentListIndex = index - 1;
    rerender();
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

        rerender();
    }
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage["tasks"]);
    tasks[currentListIndex].list.splice(index, 1);
    localStorage["tasks"] = JSON.stringify(tasks);
    rerender();
}

function editTask(index) {
    rerender();

    const nodeList = document.getElementsByTagName("LI");
    const childNodes = nodeList[index].childNodes;
    const input = document.createElement("INPUT");
    input.className = "editTaskInput";
    input.onkeyup = function (event) {
        if (event.key === "Enter") {
            const tasks = JSON.parse(localStorage["tasks"]);
            tasks[currentListIndex].list[index].item = this.value;
            localStorage["tasks"] = JSON.stringify(tasks);
            rerender();
        }
        if (event.key === "Escape") {
            rerender();
        }
    };
    const tasks = JSON.parse(localStorage["tasks"]);
    input.value = tasks[currentListIndex].list[index].item;
    nodeList[index].removeChild(childNodes[0]);
    nodeList[index].appendChild(input);

    //SET FOCUS ON INPUT
    document.getElementsByClassName("editTaskInput")[0].focus();
}

function rerender() {
    displayAllTasks();
    displayAllLists();
}

function displayAllLists() {
    let container = document.getElementById("task-lists");
    container.innerHTML = "";
    const tasks = JSON.parse(localStorage["tasks"]);
    for (let i = 0; i < tasks.length; i++) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(tasks[i].name));
        li.appendChild(createDeleteButton(i, deleteList, "list"));
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
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].list === lists[currentListIndex]) {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(tasks[i].name));
            li.appendChild(createDeleteButton(i, deleteTask, "task"));
            li.appendChild(createEditButton(i, editTask));
            container.appendChild(li);
        }
    }

    disableAllFlagsInUL("tasks", "checked");
    for (let i = 0; i < container.childNodes.length; i++) {
        if (tasks[currentListIndex].list[i].checked)
            container.childNodes[i].classList.add("checked");
    }
}

function createDeleteButton(index, targetFunction, targetTypeName) {
    const span = document.createElement("SPAN");
    span.className = "task-delete-button";
    span.appendChild(document.createTextNode("×"));
    span.onclick = function () {
        if (confirm("You really want to delete this " + targetTypeName + "?")) {
            targetFunction(index);
        }
    };
    return span;
}

function createEditButton(index, targetFunction) {
    const i = document.createElement("i");
    i.className = "task-edit-button";
    i.appendChild(document.createTextNode("Edit"));
    i.onclick = function () {
        targetFunction(index);

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

//JSON SERVER METHODS
async function getListsFromDB() {
    const response = await fetch(baseURL + '/lists')
        const data = await response.json()
        lists = JSON.parse(JSON.stringify(data));
}

async function getTasksFromDB() {
    const response = await fetch(baseURL + '/tasks');
        const data = await response.json();
        tasks = JSON.parse(JSON.stringify(data));
}

function postRequest(url, data) {
    (async () => {
        const rawResponse = await fetch(baseURL + '/' + url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        });
        const content = await rawResponse.json();
        getTasksFromDB();
    })()
}

/*
postRequest('tasks', {name: 'TASK TEST', list: "list1", checked: true})
    .then(data => console.log(data))
    .catch(error => console.error(error));*/
