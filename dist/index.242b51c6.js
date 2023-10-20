class DragDrop {
    constructor(container){
        this.container = container;
        this.target = null;
        this.initialPosition = {
            x: null,
            y: null
        };
        this.order = [];
        this.items = this.holders;
    }
    makeHolders() {
        let items = this.items;
        console.log(items.length);
        for(let i = 0; i < items.length; i++){
            let holder = document.createElement("div");
            holder.className = "holder";
            let { width, height } = DragDrop.utils.getBoundingClientRect(items[i]);
            holder.style.width = width + "px";
            holder.style.height = height + "px";
            this.container.appendChild(holder);
        }
        this.holders = this.container.querySelectorAll(".holder");
    }
    removeHolders() {
        let holders = this.container.querySelectorAll(".holder");
        for(let i = 0; i < holders.length; i++){
            let holder = holders[i];
            holder.remove();
        }
    }
    setItems() {
        this.removeHolders();
        let children = this.container.children;
        for(let i = 0; i < children.length; i++)children[i].classList.add("item");
        this.items = this.container.querySelectorAll(".item");
        this.makeHolders();
        let items = this.items;
        let holders = this.holders;
        for(let i = 0; i < items.length; i++){
            let item = items[i];
            item.setAttribute("data-ddid", i);
            let holder = holders[i];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container, "y");
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
            setTimeout(()=>{
                item.style.transition = `transform 0.15s ease-in`;
            });
            this.order.push(i);
        }
    }
    updateItems() {
        let items = this.items;
        let holders = this.holders;
        for(let i = 0; i < items.length; i++){
            let item = items[i];
            let index = Number(item.getAttribute("data-ddid"));
            if (this.target == index) continue;
            let holder = holders[this.order.indexOf(index)];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container, "y");
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
        }
    }
    firstContact(event) {
        let eventTarget = event.target;
        let target = eventTarget.getAttribute("data-ddid");
        if (target == null || !eventTarget.classList.contains("item")) return;
        let item = this.items[target];
        item.style.transition = "transform 0s";
        this.target = Number(target);
        let { pageX, pageY } = event;
        this.initialPosition = {
            x: pageX,
            y: pageY
        };
    }
    dragging(event) {
        if (this.target == null) return;
        let currentPosition = {
            x: event.pageX,
            y: event.pageY
        };
        let holder = this.holders[this.order.indexOf(this.target)];
        let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
        this.items[this.target].style.transform = `translate(${currentPosition.x - this.initialPosition.x}px,${holderBoxY - DragDrop.utils.getBoundingClientRect(this.container, "y") + currentPosition.y - this.initialPosition.y}px)`;
        this.collission(holder);
    }
    collission(current) {
        let currentBoxY = DragDrop.utils.getBoundingClientRect(current, "y");
        let holders = this.holders;
        for(let i = 0; i < holders.length; i++){
            let holder = holders[i];
            if (current == holder) continue;
            let holderBox = DragDrop.utils.getBoundingClientRect(holder);
            let item = this.items[this.target];
            let itemBox = DragDrop.utils.getBoundingClientRect(item);
            if (Math.abs(holderBox.y + holderBox.height / 2 - (itemBox.y + itemBox.height / 2)) <= itemBox.height / 2) {
                this.order = DragDrop.utils.insertAt(this.order, this.target, i);
                this.initialPosition.y = this.initialPosition.y - currentBoxY + DragDrop.utils.getBoundingClientRect(holders[this.order.indexOf(this.target)], "y");
                this.updateItems();
            }
        }
    }
    releaseContact() {
        if (this.target == null) return;
        let item = this.items[this.target];
        item.style.transition = `transform 0.15s ease-in`;
        item.style.opacity = 1;
        this.target = null;
        this.updateItems();
    }
    init() {
        this.order = [];
        this.setItems();
        const handleFirstContact = (event)=>{
            this.firstContact(event);
        };
        const handleDragging = (event)=>{
            this.dragging(event);
        };
        const handleReleaseContact = ()=>this.releaseContact();
        this.container.removeEventListener("mousedown", handleFirstContact);
        this.container.removeEventListener("mousemove", handleDragging);
        window.removeEventListener("mouseup", handleReleaseContact);
        this.container.addEventListener("mousedown", handleFirstContact);
        this.container.addEventListener("mousemove", handleDragging);
        window.addEventListener("mouseup", handleReleaseContact);
    }
    static #_ = this.utils = {
        insertAt: function(array, target, to) {
            let initial_index = array.indexOf(target);
            if (initial_index < to) return array.slice(0, initial_index).concat(array.slice(initial_index + 1, to + 1)).concat([
                target
            ]).concat(array.slice(to + 1, array.length));
            else if (initial_index > to) return array.slice(0, to).concat([
                target
            ]).concat(array.slice(to, initial_index)).concat(array.slice(initial_index + 1, array.length));
        },
        getBoundingClientRect: function(target, ...properties) {
            let rect = target.getBoundingClientRect();
            if (properties.length == 1) return rect[properties[0]];
            else if (!properties || properties.length == 0) return rect;
            let result = {};
            for(let i = 0; i < properties.length; i++){
                let property = properties[i];
                result[property] = rect[property];
            }
            return result;
        }
    };
}
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
        let dragdrop = new DragDrop(this.HTML.taskList);
        dragdrop.init();
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
