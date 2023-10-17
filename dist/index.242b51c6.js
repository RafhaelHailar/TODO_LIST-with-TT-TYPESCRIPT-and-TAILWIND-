class DragDrop {
    constructor(container){
        this.container = container;
        this.holding = false;
        this.initialPosition = {
            x: this.container.offsetLeft,
            y: this.container.offsetTop
        };
        this.initialPositionHTML = document.createElement("div");
        this.initialPositionHTML.innerHTML = `x: ${this.initialPosition.x} y: ${this.initialPosition.y}`;
        document.body.appendChild(this.initialPositionHTML);
        this.changedPositionHTML = document.createElement("div");
        this.changedPositionHTML.innerHTML = "";
        document.body.appendChild(this.changedPositionHTML);
    }
    updateHolding(isHolding) {
        this.holding = isHolding;
    }
    firstContact(position) {
        this.initialPosition = position;
        this.initialPositionHTML.innerHTML = `x: ${this.initialPosition.x} y: ${this.initialPosition.y}`;
        this.updateHolding(true);
    }
    releaseContact() {
        this.updateHolding(false);
    }
    isInContact() {
        return this.holding;
    }
    init() {
        const handleFirstContact = (event)=>{
            let x = event.pageX;
            let y = event.pageY;
            this.firstContact({
                x,
                y
            });
        };
        const handleReleaseContact = ()=>{
            this.releaseContact();
        };
        const handleDragging = (event)=>{
            if (!this.isInContact()) return;
            let x = event.pageX;
            let y = event.pageY;
            let delta_x = x - this.initialPosition.x;
            let delta_y = y - this.initialPosition.y;
            this.container.style.transform = `translate(${delta_x}px,${delta_y}px)`;
            this.changedPositionHTML.innerHTML = `x: ${x} y: ${y}`;
        /*    this.initialPosition = {x,y}; */ };
        this.container.addEventListener("mousedown", handleFirstContact);
        this.container.addEventListener("mousemove", handleDragging);
        window.addEventListener("mouseup", handleReleaseContact);
    }
}
class TaskHandler {
    constructor(container){
        this._TASKS = [];
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
        task_name_input?.removeAttribute("disabled");
        task_name_input?.focus();
        task_name_input?.addEventListener("blur", finishUpdate.bind(this));
        function finishUpdate() {
            task_name_input?.setAttribute("disabled", "");
            this._TASKS[index].task_name = task_name_input?.value;
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
            container.className = "task-item flex border justify-between cursor-pointer select-none absolute w-full";
            //the task name starts with disabled / can't be edited , but once the update button is clicked it will be updatable again
            let task_name_display = document.createElement("input");
            task_name_display.setAttribute("disabled", "");
            task_name_display.className = "disabled:bg-white disabled:cursor-pointer";
            task_name_display.value = task_name;
            //the done and update buttons
            let done_btn = document.createElement("button");
            done_btn.innerHTML = "DONE";
            let update_btn = document.createElement("button");
            update_btn.innerHTML = "UPDATE";
            done_btn.className = update_btn.className = "border px-5 py-2";
            //add the handlers
            done_btn.addEventListener("click", ()=>this.removeTask(i));
            update_btn.addEventListener("click", ()=>this.updateTask(i));
            //put all of the to the container
            container.appendChild(task_name_display);
            container.appendChild(update_btn);
            container.appendChild(done_btn);
            //add the handler for drag and drop
            let drag_drop = new DragDrop(container);
            drag_drop.init();
            //put the container to the task list
            this.HTML.taskList.appendChild(container);
            //solution for disabled element event listener don't work
            let task_name_display_box = document.createElement("div");
            task_name_display_box.className = "absolute top-0 left-0";
            task_name_display_box.style.width = task_name_display.offsetWidth + "px";
            task_name_display_box.style.height = task_name_display.offsetHeight + "px";
            container.appendChild(task_name_display_box);
            container.style.transform = `translateY(${i * container.offsetHeight}px)`;
        }
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

//# sourceMappingURL=index.242b51c6.js.map
