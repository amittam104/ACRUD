import "./style.css";
import { Client, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_URL)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Declare dom element variables
const db = new Databases(client);
const tasks = document.querySelector(".tasks");
const taskCounter = document.querySelector(".task-counter");
const taskInput = document.getElementById("task-input");
const btnInput = document.querySelector(".btn-input");
const btnSignUp = document.querySelector(".btn-signup");
const btnLogIn = document.querySelector(".btn-login");
const containerSignUp = document.querySelector(".popup-signup");
const containerLogIn = document.querySelector(".popup-login");
const containerApp = document.querySelector(".container-app");
const btnCloseSignUp = document.querySelector(".close-signup");
const btnCloseLogIn = document.querySelector(".close-login");

// Fetch Tasks from Appwrite backed
const getTasks = async function () {
  try {
    const response = await db.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_ID
    );

    const tasksList = response.documents;

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
          <p class="task-text task-text-${task.$id}" id="text-${task.status}">${task.body}</p>
        </div>
        <div class="update-delete">
          <div id="update-${task.$id}">
            <img
              class="task-icon"
              src="img/note-pencil-bold.svg"
              alt="edit icon"
              id="update-icon-${task.$id}"
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
  const updateTask = document.getElementById(`update-${task.$id}`);

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
      taskCounter.textContent--;
    } catch (err) {
      console.error(err);
    }
  });

  // Update Task
  updateTask.addEventListener("click", async function (e) {
    let updateInputHTML = `
    <input
      type="text"
      name="update-task-input"
      class="update-task-text"
      id="update-task-${task.$id}"
      placeholder="Update your task..."
    />
    
  `;

    const taskText =
      e.target.parentElement.parentElement.parentElement.firstElementChild
        .lastElementChild;

    taskText.innerHTML = updateInputHTML;

    const updateTaskInput = document.getElementById(`update-task-${task.$id}`);
    updateTaskInput.value = `${task.body}`;

    // console.log(updateTaskInput.value);

    updateTaskInput.addEventListener("keydown", async function (e) {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        task.body = updateTaskInput.value;
        console.log(task.body);

        taskText.innerHTML = task.body;
        await db.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID,
          task.$id,
          { body: `${task.body}` }
        );
      }
    });
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

  // Update Task Number Counter
  taskCounter.textContent = tasks.childElementCount;
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

// Signup and Log in form Modal
btnSignUp.addEventListener("click", function () {
  btnSignUp.disabled = true;
  btnLogIn.disabled = true;
  containerSignUp.classList.toggle("hidden");
  containerApp.classList.toggle("blur");
});

btnLogIn.addEventListener("click", function () {
  btnSignUp.disabled = true;
  btnLogIn.disabled = true;
  containerLogIn.classList.toggle("hidden");
  containerApp.classList.toggle("blur");
});

btnCloseSignUp.addEventListener("click", function () {
  btnSignUp.disabled = false;
  btnLogIn.disabled = false;
  containerSignUp.classList.add("hidden");
  containerApp.classList.remove("blur");
});
btnCloseLogIn.addEventListener("click", function () {
  btnSignUp.disabled = false;
  btnLogIn.disabled = false;
  containerLogIn.classList.add("hidden");
  containerApp.classList.remove("blur");
});
