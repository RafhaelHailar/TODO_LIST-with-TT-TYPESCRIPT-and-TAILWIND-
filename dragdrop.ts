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
            holder.className = "holder";
            let {top,left,width,height} = DragDrop.utils.getBoundingClientRect(items[i]) as DOMRect;
            let containerBox = DragDrop.utils.getBoundingClientRect(this.container) as DOMRect;
            
            holder.style.backgroundColor = "rgba(0,0,0,.04)";
            holder.style.margin = getComputedStyle(items[i]).margin;
            holder.style.width = width + "px";
            holder.style.height = height + "px";
            holder.style.top = `translate(${left - containerBox.x}px,${top - containerBox.y}px)`;
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
            children.style.position = "absolute";
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
            item.style.margin = '0';
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
        let current_element = event.target as HTMLElement;
        while (current_element != document.body) {
            if (current_element.classList.contains("item")) {
                break;
            }
            current_element = current_element.parentElement as HTMLElement;
        }   
        let target = current_element.getAttribute("data-ddid");
        if (target == null || !current_element.classList.contains("item")) return;

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

        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.position = "relative";

        this.setItems();
        
        const handleFirstContact = (event: MouseEvent): void => {
            event.stopPropagation();
            this.firstContact(event);
        }

        const handleDragging = (event: MouseEvent): void => {
            this.dragging(event);
            event.stopPropagation();
        }

        const handleReleaseContact = (event: MouseEvent): void => {event.stopPropagation();this.releaseContact()};

        function reqr(event: Event): void {
            event.stopPropagation();
        }

        this.container.removeEventListener("mousedown",handleFirstContact,true);
        this.container.removeEventListener("mousemove",handleDragging,true);
        window.removeEventListener("mouseup",handleReleaseContact,true);

        this.container.addEventListener("mousedown",handleFirstContact,true);
        this.container.addEventListener("click",reqr,true);
        this.container.addEventListener("mousemove",handleDragging,true);
        window.addEventListener("mouseup",handleReleaseContact,true);
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