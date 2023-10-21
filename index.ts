type Task = {
    task_name: string;
}

class DragDrop {
    container: HTMLElement;
    target: null | number;
    initialPosition: Record<string,null | number>;
    items: any;
    holders: any;
    order: number[]

    constructor(container: HTMLElement) {
        this.container = container;
        this.target = null;
        this.initialPosition = {
            x : null,
            y : null
        };
        this.order = [];
        this.items = this.holders;
    }

    makeHolders(): void {
        let items = this.items;
        for (let i = 0;i < items.length;i++) {
            let holder = document.createElement("div");
            holder.className = "holder bg-gray-100 my-0.5";
            let {top,left,width,height} = DragDrop.utils.getBoundingClientRect(items[i]) as DOMRect;
            let containerBox = DragDrop.utils.getBoundingClientRect(this.container) as DOMRect;
            holder.style.width = width + "px";
            holder.style.height = height + "px";
            this.container.appendChild(holder);
        }
        this.holders = this.container.querySelectorAll(".holder");
    }

    removeHolders(): void {
        let holders = this.container.querySelectorAll(".holder");
        for (let i = 0;i < holders.length;i++) {
            let holder = holders[i];
            holder.remove();
        }
    }   

    setItems(): void {
        this.removeHolders();
        
        let childrens = this.container.children;         
        for (let i = 0;i < childrens.length;i++) {
            let children = childrens[i] as HTMLElement;
            children.classList.add("item");
            children.classList.add("absolute");
            children.style.transition = "transform 0s";
        }
        
        this.items = this.container.querySelectorAll(".item") as NodeListOf<Element>;
        this.makeHolders();

        let items = this.items;
        let holders = this.holders;
        for (let i = 0;i < items.length;i++) {
            let item = items[i];
            item.setAttribute("data-ddid",i);
            let holder = holders[i];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container,"y") as number;
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;

            setTimeout(() => {
                item.style.transition = `transform 0.15s ease-in`;
            });

            this.order.push(i);
        }
    }

    updateItems(): void {
        let items = this.items;
        let holders = this.holders;
        for (let i = 0;i < items.length;i++) {
            let item = items[i];
            let index = Number(item.getAttribute("data-ddid"));
            if (this.target == index) continue;
            let holder = holders[this.order.indexOf(index)];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container,"y") as number;
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
        }
    }


    firstContact(event: MouseEvent): void {
        let eventTarget: HTMLElement = event.target as HTMLElement;
        let target = eventTarget.getAttribute("data-ddid");
        if (target == null || !eventTarget.classList.contains("item")) return;

        let item = this.items[target];
        item.style.transition = "transform 0s";

        this.target = Number(target);
        let {pageX,pageY} = event;
        this.initialPosition = {
            x: pageX,
            y: pageY
        };
    }

    dragging(event: MouseEvent): void {
        if (this.target == null) return;
        let currentPosition = {
            x: event.pageX,
            y: event.pageY
        }

        let holder = this.holders[this.order.indexOf(this.target)];
        let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;
        this.items[this.target].style.transform = `translate(${currentPosition.x - (this.initialPosition.x as number)}px,${(holderBoxY - (DragDrop.utils.getBoundingClientRect(this.container,"y") as number)) + currentPosition.y - (this.initialPosition.y as number)}px)`;

        this.collission(holder);
    }

    collission(current: HTMLElement): void {
        let currentBoxY = DragDrop.utils.getBoundingClientRect(current,"y") as number;
        let holders = this.holders;

        for (let i = 0;i < holders.length;i++) {
            let holder = holders[i];
            if (current == holder) continue;
            let holderBox = DragDrop.utils.getBoundingClientRect(holder) as DOMRect;
            let item = this.items[this.target as number];
            let itemBox = DragDrop.utils.getBoundingClientRect(item) as DOMRect;
            if (Math.abs((holderBox.y + holderBox.height / 2) - (itemBox.y + itemBox.height / 2)) <= itemBox.height / 2) {

                this.order = DragDrop.utils.insertAt(this.order,this.target as number,i) as number[];
                this.initialPosition.y = ((this.initialPosition.y as number) - currentBoxY) + (DragDrop.utils.getBoundingClientRect(holders[this.order.indexOf(this.target as number)],"y") as number);
                this.updateItems();
            }
        }
    }

    releaseContact(): void {
        if (this.target == null) return;

        let item = this.items[this.target];
        item.style.transition = `transform 0.15s ease-in`;
        item.style.opacity = 1;
        this.target = null;
        this.updateItems();
    }

    init(): void {
        this.order = [];

        this.setItems();
        
        const handleFirstContact = (event: MouseEvent): void => {
            this.firstContact(event);
        }

        const handleDragging = (event: MouseEvent): void => {
            this.dragging(event);
        }

        const handleReleaseContact = () => this.releaseContact();

        this.container.removeEventListener("mousedown",handleFirstContact);
        this.container.removeEventListener("mousemove",handleDragging);
        window.removeEventListener("mouseup",handleReleaseContact);

        this.container.addEventListener("mousedown",handleFirstContact);
        this.container.addEventListener("mousemove",handleDragging);
        window.addEventListener("mouseup",handleReleaseContact);
    }
    
    static utils = {
        insertAt: function(array: number[],target: number,to: number): number[] | undefined  {
            let initial_index = array.indexOf(target);
            if (initial_index < to) {
                return array.slice(0,initial_index).concat(array.slice(initial_index + 1,to + 1)).concat([target]).concat(array.slice(to + 1,array.length));
            } else if (initial_index > to) {
                return array.slice(0,to).concat([target]).concat(array.slice(to,initial_index)).concat(array.slice(initial_index + 1,array.length));
            }
        },
        getBoundingClientRect: function(target: HTMLElement,...properties: Array<string>): (number | DOMRect | object) {   
            let rect: Record<string,number> = target.getBoundingClientRect() as any;
            if (properties.length == 1) {
                return rect[properties[0]];
            }else if (!properties || properties.length == 0) return rect;

            let result: Record<string,number> = {};
            for (let i = 0;i < properties.length;i++) {
                let property = properties[i];
                result[property] = rect[property];
            }
            return result;
        }
    }
}

class TaskHandler {
    _TASKS: Array<Task>;
    HTML: Record<string,HTMLElement>;
    container: HTMLElement;
    constructor(container: HTMLElement) {
        this._TASKS = [];
        this.container = container;

        //container all html used
        this.HTML = {
            addTask: container.querySelector("#add-task-form") as HTMLElement,
            taskList: container.querySelector("#task-list") as HTMLElement,
            noTask: container.querySelector("#no-task") as HTMLElement
        };
    }

    //as the name say it take a Task type value and push that to the _TASKS container and then update the display
    addTask(task: Task): void {
        this._TASKS.push(task);
        this.displayTask();
    }

    //remove the task by the index and then update the display
    removeTask(index: number): void {
        this._TASKS.splice(index,1);
        this.displayTask();
    }

    //update the task by the index and then update the display
    updateTask(index: number): void {
        let task_item = this.HTML.taskList.querySelectorAll("#task-list .task-item")[index];
        let task_name_input = task_item.querySelector("input");
    
        task_name_input?.removeAttribute("disabled");
        task_name_input?.focus();
    
        task_name_input?.addEventListener("blur",finishUpdate.bind(this));
    
        function finishUpdate(this: TaskHandler): void {
            task_name_input?.setAttribute("disabled","");
            this._TASKS[index].task_name = task_name_input?.value as string;
        }
    }

    displayTask(): void {
        //remove the html tasklist child/s
        this.HTML.taskList.innerHTML = "";

        //show "NO TASK" html if there is no task in the task list
        this.updateNoTaskDisplay(this.getTasksTotal() > 0);

        for (let i = 0;i < this.getTasksTotal();i++) {
            const {task_name} = this._TASKS[i] as Task;

            //outer cointainer
            let container = document.createElement("div");
            container.className = "task-item flex border justify-between cursor-pointer select-none w-full bg-white";

            //the task name starts with disabled / can't be edited , but once the update button is clicked it will be updatable again
            let task_name_display: HTMLInputElement = document.createElement("input");
            task_name_display.setAttribute("disabled","");
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
            done_btn.addEventListener("click",() => this.removeTask(i));
            update_btn.addEventListener("click",() => this.updateTask(i));
            
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
        setTimeout(() =>  dragdrop.init());
    }

    updateNoTaskDisplay(hide: boolean): void {
        if (hide) this.HTML.noTask.classList.add("hidden");
        else this.HTML.noTask.classList.remove("hidden");
    }

    getTasksTotal(): number {
        return this._TASKS.length;
    }

    init():void {
        this.HTML.addTask.addEventListener("submit",handleAddTask.bind(this));

        //handle events
        function handleAddTask(this: TaskHandler,event: Event):void {
            event.preventDefault();

            //get the add task input value
            let task_name_input = this.HTML.addTask.querySelector("input") as HTMLInputElement;
            let task_name = task_name_input.value;

            const TASK: Task = {
                task_name
            };

            //reset the input 
            task_name_input.value = "";

            //add the task
            this.addTask(TASK);
        }
    }
}

const taskHandler = new TaskHandler(document.querySelector("#task-handler") as HTMLElement);
taskHandler.init();