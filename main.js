import "./style.css";
import { Client, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_URL)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const db = new Databases(client);
const tasks = document.querySelector(".tasks");
const taskCounter = document.querySelector(".task-counter");
const taskInput = document.getElementById("task-input");
const btnInput = document.querySelector(".btn-input");

const getTasks = async function () {
  try {
    const response = await db.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_ID
    );

    const tasksList = response.documents;

    // Update Task Number Counter
    taskCounter.textContent = tasksList.length;

    tasksList.forEach((task) => renderTasks(task));
  } catch (err) {
    console.error(err);
  }
};

getTasks();

// Render Tasks
const renderTasks = async function (task) {
  let html = `
      <div class="task" id="task-${task.$id}" data-id="${task.$id}">
        <div class="task-select">
          <div class="complete-${task.status} select-icon">&nbsp;</div>
          <p class="task-text">${task.body}</p>
        </div>
        <div class="update-delete">
          <div id="update-icon">
            <img
              class="task-icon"
              src="img/note-pencil-bold.svg"
              alt="edit icon"
            />
          </div>
          <div id="delete-${task.$id}">
            <img
              class="task-icon"
              src="img/x-circle-bold.svg"
              alt="close icon"
            />
          </div>
        </div>
    </div>`;

  // Render Each one of the task
  tasks.insertAdjacentHTML("afterBegin", html);
};

// Add task function
const addTask = async function () {
  try {
    const response = await db.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_ID,
      ID.unique(),
      { body: `${taskInput.value}` }
    );

    renderTasks(response);
  } catch (err) {
    console.error(err);
  }
};

// Input button event listner
btnInput.addEventListener("click", addTask);
