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

// Fetch Tasks from Appwrite backed
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

// Render Tasks on the screen
const renderTasks = async function (task) {
  let html = `
      <div class="task" id="task-${task.$id}" data-id="${task.$id}">
        <div class="task-select">
          <div class="complete-${task.status}" id="complete-${task.status}">&nbsp;</div>
          <p class="task-text" id="text-${task.status}">${task.body}</p>
        </div>
        <div class="update-delete">
          <div id="update-${task.$id}">
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

  // Render Each one of the task inside tasks
  tasks.insertAdjacentHTML("afterBegin", html);

  // Variables declaration for update and delete tasks
  const deleteTask = document.getElementById(`delete-${task.$id}`);
  const taskWrapper = document.getElementById(`task-${task.$id}`);
  const statusTask = document.getElementById(`complete-${task.status}`);

  // Delete Task
  deleteTask.addEventListener("click", async function () {
    try {
      // Update database
      await db.deleteDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        task.$id
      );

      // Update UI
      taskWrapper.remove();
    } catch (err) {
      console.error(err);
    }
  });

  // Update the status of the task (Completed or in Progress)
  statusTask.addEventListener("click", async function (e) {
    try {
      task.status = !task.status;

      // Update UI
      e.target.className = `complete-${task.status}`;
      e.target.nextElementSibling.id = `text-${task.status}`;

      // Update DataBase
      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        task.$id,
        { status: task.status }
      );
    } catch (err) {
      console.error(err);
    }
  });
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
    taskInput.value = "";
  } catch (err) {
    console.error(err);
  }
};

// Input button event listner
btnInput.addEventListener("click", addTask);

// Enter button event listner to add task
taskInput.addEventListener("keydown", function (e) {
  if (e.code === "Enter" || e.code === "NumpadEnter") {
    addTask();
  }
});
