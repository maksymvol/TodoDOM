let currentListIndex = 0;
const baseURL = "http://localhost:3000";
let lists = [];
let tasks = [];

async function setup() {
    await getListsFromDB();
    await getTasksFromDB();

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

    await rerender();
}

async function addNewList() {
    const input = document.getElementById("new-list-input");

    if (input.value == "") {
        alert("Please type list name before adding it");
    } else {
        const newList = {name: input.value};
        await postRequest('lists', newList);
        input.value = "";

        await getListsFromDB();
        await rerender();
    }
}

async function toggleTaskChecked(taskName) {
    let newId = -1;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].name === taskName) {
            newId = i;
            break;
        }
    }
    const task = tasks[newId];
    task.checked = !task.checked;
    await createPatch('tasks', newId, task);
    await getTasksFromDB();
}

async function toggleCurrentList(listName) {
    let newId = currentListIndex;
    for (let i = 0; i < lists.length; i++) {
        if (lists[i].name === listName) {
            newId = i;
            break;
        }
    }

    if (newId >= 0 && newId < lists.length) {
        currentListIndex = newId;
        await rerender();
    }
}

async function deleteList(index) {
    await deleteElementFromDB('lists', index);
    await getListsFromDB();
    await getTasksFromDB();
    currentListIndex = index - 1;
    await rerender();
}

async function addNewTask() {
    const input = document.getElementById("task-input");

    if (input.value == "") {
        alert("Please type your task before adding it");
    } else {
        const task = {name: input.value, checked: false, list: lists[currentListIndex].name};
        await postRequest('tasks', task);

        input.value = "";
        await getTasksFromDB();
        await rerender();
    }
}

async function deleteTask(index) {
    await deleteElementFromDB('tasks', index);
    await getTasksFromDB();
    await rerender();
}

async function editTask(index) {
    await rerender();

    const nodeList = document.getElementsByTagName("LI");

    let newIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].list === lists[currentListIndex].name) {
            if (tasks[i].id === index) {
                break;
            }
            newIndex++;
        }
    }
    const childNodes = nodeList[newIndex].childNodes;
    const input = document.createElement("INPUT");
    input.className = "editTaskInput";
    input.onkeyup = async function (event) {
        if (event.key === "Enter") {
            await createPatch('tasks', index, {name: this.value, checked: false, list: lists[currentListIndex].name});
            await getTasksFromDB();
            await rerender();
        }
        if (event.key === "Escape") {
            await rerender();
        }
    };
    let taskIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === index) {
            taskIndex = i;
            break;
        }
    }
    input.value = tasks[taskIndex].name;
    nodeList[newIndex].removeChild(childNodes[0]);
    nodeList[newIndex].appendChild(input);

    //SET FOCUS ON INPUT
    document.getElementsByClassName("editTaskInput")[0].focus();
}

async function rerender() {
    await displayAllTasks();
    await displayAllLists();
}

function displayAllLists() {
    let container = document.getElementById("task-lists");
    container.innerHTML = "";
    for (let i = 0; i < lists.length; i++) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(lists[i].name));
        li.appendChild(createDeleteButton(lists[i].id, deleteList, "list"));
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
        if (tasks[i].list === lists[currentListIndex].name) {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(tasks[i].name));
            li.appendChild(createDeleteButton(tasks[i].id, deleteTask, "task"));
            li.appendChild(createEditButton(tasks[i].id, editTask));
            container.appendChild(li);
        }
    }

    disableAllFlagsInUL("tasks", "checked");
    let index = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].checked && tasks[i].list === lists[currentListIndex].name) {
            container.childNodes[index].classList.add("checked");
        }
        if (tasks[i].list === lists[currentListIndex].name) {
            index++;
        }
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

async function postRequest(url, data) {
    const rawResponse = await fetch(baseURL + '/' + url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    const content = await rawResponse.json();
}

async function createPatch(url, id, data) {
    const rawResponse = await fetch(baseURL + '/' + url + '/' + id, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    const content = await rawResponse.json();
}

async function deleteElementFromDB(url, id) {
    const rawResponse = await fetch(baseURL + '/' + url + '/' + id, {
        method: 'DELETE',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    const content = await rawResponse.json();
}

async function updateDB(url, data) {
    const rawResponse = await fetch(baseURL + '/' + url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    const content = await rawResponse.json();
}
