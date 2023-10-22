"use strict";
class TaskHandler {
    constructor(container){
        this._TASKS = [];
        this.container = container;
        //container all html used
        this.HTML = {
            addTask: container.querySelector("#add-task-form"),
            taskList: container.querySelector("#task-list"),
            noTask: container.querySelector("#no-task")
        };
    }
    //as the name say it take a Task type value and push that to the _TASKS container and then update the display
    addTask(task) {
        this._TASKS.push(task);
        this.displayTask();
    }
    //remove the task by the index and then update the display
    removeTask(index) {
        this._TASKS.splice(index, 1);
        this.displayTask();
    }
    //update the task by the index and then update the display
    updateTask(index) {
        let task_item = this.HTML.taskList.querySelectorAll("#task-list .task-item")[index];
        let task_name_input = task_item.querySelector("input");
        task_name_input === null || task_name_input === void 0 || task_name_input.removeAttribute("disabled");
        task_name_input === null || task_name_input === void 0 || task_name_input.focus();
        task_name_input === null || task_name_input === void 0 || task_name_input.addEventListener("blur", finishUpdate.bind(this));
        function finishUpdate() {
            task_name_input === null || task_name_input === void 0 || task_name_input.setAttribute("disabled", "");
            this._TASKS[index].task_name = task_name_input === null || task_name_input === void 0 ? void 0 : task_name_input.value;
        }
    }
    displayTask() {
        //remove the html tasklist child/s
        this.HTML.taskList.innerHTML = "";
        //show "NO TASK" html if there is no task in the task list
        this.updateNoTaskDisplay(this.getTasksTotal() > 0);
        for(let i = 0; i < this.getTasksTotal(); i++){
            const { task_name } = this._TASKS[i];
            //outer cointainer
            let container = document.createElement("div");
            container.className = "task-item flex border justify-between cursor-pointer select-none w-full bg-white my-3";
            //the task name starts with disabled / can't be edited , but once the update button is clicked it will be updatable again
            let task_name_display = document.createElement("input");
            task_name_display.setAttribute("disabled", "");
            task_name_display.className = "disabled:bg-white disabled:cursor-pointer mx-5";
            task_name_display.value = task_name;
            //container for buttons
            let btn_container = document.createElement("div");
            //the done and update buttons
            let done_btn = document.createElement("button");
            done_btn.innerHTML = "DONE";
            let update_btn = document.createElement("button");
            update_btn.innerHTML = "UPDATE";
            done_btn.className = update_btn.className = "border px-5 py-2 text-slate-100 rounded";
            done_btn.classList.add("bg-red-500");
            update_btn.classList.add("bg-cyan-500");
            //add the handlers
            done_btn.addEventListener("click", ()=>this.removeTask(i));
            update_btn.addEventListener("click", ()=>this.updateTask(i));
            btn_container.appendChild(update_btn);
            btn_container.appendChild(done_btn);
            //put all of the to the container
            container.appendChild(task_name_display);
            container.appendChild(btn_container);
            //put the container to the task list
            this.HTML.taskList.appendChild(container);
            //solution for disabled element event listener don't work
            let task_name_display_box = document.createElement("div");
            task_name_display_box.className = "absolute top-0 left-0";
            task_name_display_box.style.width = task_name_display.offsetWidth + "px";
            task_name_display_box.style.height = task_name_display.offsetHeight + "px";
            container.appendChild(task_name_display_box);
        }
        let dragdrop = new DragDrop(this.HTML.taskList);
        setTimeout(()=>dragdrop.init());
    }
    updateNoTaskDisplay(hide) {
        if (hide) this.HTML.noTask.classList.add("hidden");
        else this.HTML.noTask.classList.remove("hidden");
    }
    getTasksTotal() {
        return this._TASKS.length;
    }
    init() {
        this.HTML.addTask.addEventListener("submit", handleAddTask.bind(this));
        //handle events
        function handleAddTask(event) {
            event.preventDefault();
            //get the add task input value
            let task_name_input = this.HTML.addTask.querySelector("input");
            let task_name = task_name_input.value;
            const TASK = {
                task_name
            };
            //reset the input 
            task_name_input.value = "";
            //add the task
            this.addTask(TASK);
        }
    }
}
const taskHandler = new TaskHandler(document.querySelector("#task-handler"));
taskHandler.init();

//# sourceMappingURL=index.c36f364e.js.map
