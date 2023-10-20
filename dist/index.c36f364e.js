var DragDrop = /** @class */ function() {
    function DragDrop(container) {
        this.container = container;
        this.holding = false;
        this.initialPosition = {
            x: this.container.offsetLeft,
            y: this.container.offsetTop
        };
        this.initialPositionHTML = document.createElement("div");
        this.initialPositionHTML.innerHTML = "x: ".concat(this.initialPosition.x, " y: ").concat(this.initialPosition.y);
        document.body.appendChild(this.initialPositionHTML);
        this.changedPositionHTML = document.createElement("div");
        this.changedPositionHTML.innerHTML = "";
        document.body.appendChild(this.changedPositionHTML);
    }
    DragDrop.prototype.updateHolding = function(isHolding) {
        this.holding = isHolding;
    };
    DragDrop.prototype.firstContact = function(position) {
        this.initialPosition = position;
        this.initialPositionHTML.innerHTML = "x: ".concat(this.initialPosition.x, " y: ").concat(this.initialPosition.y);
        this.updateHolding(true);
    };
    DragDrop.prototype.releaseContact = function() {
        this.updateHolding(false);
    };
    DragDrop.prototype.isInContact = function() {
        return this.holding;
    };
    DragDrop.prototype.init = function() {
        var _this = this;
        var handleFirstContact = function(event) {
            var x = event.pageX;
            var y = event.pageY;
            _this.firstContact({
                x: x,
                y: y
            });
        };
        var handleReleaseContact = function() {
            _this.releaseContact();
        };
        var handleDragging = function(event) {
            if (!_this.isInContact()) return;
            var x = event.pageX;
            var y = event.pageY;
            var delta_x = x - _this.initialPosition.x;
            var delta_y = y - _this.initialPosition.y;
            _this.container.style.transform = "translate(".concat(delta_x, "px,").concat(delta_y, "px)");
            _this.changedPositionHTML.innerHTML = "x: ".concat(x, " y: ").concat(y);
        /*    this.initialPosition = {x,y}; */ };
        this.container.addEventListener("mousedown", handleFirstContact);
        this.container.addEventListener("mousemove", handleDragging);
        window.addEventListener("mouseup", handleReleaseContact);
    };
    return DragDrop;
}();
var TaskHandler = /** @class */ function() {
    function TaskHandler(container) {
        this._TASKS = [];
        //container all html used
        this.HTML = {
            addTask: container.querySelector("#add-task-form"),
            taskList: container.querySelector("#task-list"),
            noTask: container.querySelector("#no-task")
        };
    }
    //as the name say it take a Task type value and push that to the _TASKS container and then update the display
    TaskHandler.prototype.addTask = function(task) {
        this._TASKS.push(task);
        this.displayTask();
    };
    //remove the task by the index and then update the display
    TaskHandler.prototype.removeTask = function(index) {
        this._TASKS.splice(index, 1);
        this.displayTask();
    };
    //update the task by the index and then update the display
    TaskHandler.prototype.updateTask = function(index) {
        var task_item = this.HTML.taskList.querySelectorAll("#task-list .task-item")[index];
        var task_name_input = task_item.querySelector("input");
        task_name_input === null || task_name_input === void 0 || task_name_input.removeAttribute("disabled");
        task_name_input === null || task_name_input === void 0 || task_name_input.focus();
        task_name_input === null || task_name_input === void 0 || task_name_input.addEventListener("blur", finishUpdate.bind(this));
        function finishUpdate() {
            task_name_input === null || task_name_input === void 0 || task_name_input.setAttribute("disabled", "");
            this._TASKS[index].task_name = task_name_input === null || task_name_input === void 0 ? void 0 : task_name_input.value;
        }
    };
    TaskHandler.prototype.displayTask = function() {
        var _this = this;
        //remove the html tasklist child/s
        this.HTML.taskList.innerHTML = "";
        //show "NO TASK" html if there is no task in the task list
        this.updateNoTaskDisplay(this.getTasksTotal() > 0);
        var _loop_1 = function(i) {
            var task_name = this_1._TASKS[i].task_name;
            //outer cointainer
            var container = document.createElement("div");
            container.className = "task-item flex border justify-between cursor-pointer select-none absolute w-full";
            //the task name starts with disabled / can't be edited , but once the update button is clicked it will be updatable again
            var task_name_display = document.createElement("input");
            task_name_display.setAttribute("disabled", "");
            task_name_display.className = "disabled:bg-white disabled:cursor-pointer";
            task_name_display.value = task_name;
            //the done and update buttons
            var done_btn = document.createElement("button");
            done_btn.innerHTML = "DONE";
            var update_btn = document.createElement("button");
            update_btn.innerHTML = "UPDATE";
            done_btn.className = update_btn.className = "border px-5 py-2";
            //add the handlers
            done_btn.addEventListener("click", function() {
                return _this.removeTask(i);
            });
            update_btn.addEventListener("click", function() {
                return _this.updateTask(i);
            });
            //put all of the to the container
            container.appendChild(task_name_display);
            container.appendChild(update_btn);
            container.appendChild(done_btn);
            //add the handler for drag and drop
            var drag_drop = new DragDrop(container);
            drag_drop.init();
            //put the container to the task list
            this_1.HTML.taskList.appendChild(container);
            //solution for disabled element event listener don't work
            var task_name_display_box = document.createElement("div");
            task_name_display_box.className = "absolute top-0 left-0";
            task_name_display_box.style.width = task_name_display.offsetWidth + "px";
            task_name_display_box.style.height = task_name_display.offsetHeight + "px";
            container.appendChild(task_name_display_box);
            container.style.transform = "translateY(".concat(i * container.offsetHeight, "px)");
        };
        var this_1 = this;
        for(var i = 0; i < this.getTasksTotal(); i++)_loop_1(i);
    };
    TaskHandler.prototype.updateNoTaskDisplay = function(hide) {
        if (hide) this.HTML.noTask.classList.add("hidden");
        else this.HTML.noTask.classList.remove("hidden");
    };
    TaskHandler.prototype.getTasksTotal = function() {
        return this._TASKS.length;
    };
    TaskHandler.prototype.init = function() {
        this.HTML.addTask.addEventListener("submit", handleAddTask.bind(this));
        //handle events
        function handleAddTask(event) {
            event.preventDefault();
            //get the add task input value
            var task_name_input = this.HTML.addTask.querySelector("input");
            var task_name = task_name_input.value;
            var TASK = {
                task_name: task_name
            };
            //reset the input 
            task_name_input.value = "";
            //add the task
            this.addTask(TASK);
        }
    };
    return TaskHandler;
}();
var taskHandler = new TaskHandler(document.querySelector("#task-handler"));
taskHandler.init();

//# sourceMappingURL=index.c36f364e.js.map
