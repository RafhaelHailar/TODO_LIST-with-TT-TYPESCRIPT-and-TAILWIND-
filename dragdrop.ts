class DragDrop {
    container: HTMLElement;
    target: null | number;
    initialPosition: Record<string,null | number>;
    items: any;
    holders: any;
    isDragging: boolean;
    orderHolder: any;
    orderName: string;
    order: any[];

    constructor(container: HTMLElement,orderHolder: any,orderName: string) {
        this.container = container;
        this.target = null;
        this.initialPosition = {
            x : null,
            y : null
        };
        this.items = this.holders;
        this.isDragging = false;
        this.orderHolder = orderHolder;
        this.order = orderHolder[orderName];
        this.orderName = orderName;
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
            holder.style.transform = `translate(${left - containerBox.x}px,${top - containerBox.y}px)`;
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
            item.setAttribute("data-ddid",this.order[i].id);
            let holder = holders[i];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container,"y") as number;
            item.style.margin = '0';
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;

            setTimeout(() => {
                item.style.transition = `transform 0.15s ease-in`;
            });

        }
    }

    updateItems(): void {
        let items = this.items;
        let holders = this.holders;
        for (let i = 0;i < items.length;i++) {
            let item = items[i];
            let index = Number(item.getAttribute("data-ddid"));
            if (this.target == index) continue;
     
            let holder = holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order,"id",index))];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container,"y") as number;
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
        }
    }

    /*
     * The first contact or the first touch
     * it will look for an element that contain an item class when you clicked to an element,
     * if the element you clicked does not contain the class it will look for its parent,
     * it will look until the element is the body.
     * then get its data id,from the data id find the element in this.items that contain the same, 
     * id data value then set its transition to transform 0s,
     * then set the inital position value to the positon of where you click.
    */
    firstContact(event: MouseEvent): void {
        let eventTarget: HTMLElement = event.target as HTMLElement;
        let current_element = event.target as HTMLElement;

        while (current_element != document.body) {
            if (current_element.classList.contains("item")) break;
            current_element = current_element.parentElement as HTMLElement;
        }   

        let target = current_element.getAttribute("data-ddid");
        if (target == null ) return;
    
        let item = Array.from(this.items).find((value) => {
            let element = value as HTMLElement;
            return element.getAttribute("data-ddid") == target;
        }) as HTMLElement;

        item.style.transition = "transform 0s";

        this.target = Number(target);
        let {pageX,pageY} = event;
        this.initialPosition = {
            x: pageX,
            y: pageY
        };
    }

    /*
     * The dragging part when the user hold the target item
     * if there is no target item dont run the function ,
     *
     *
    */
    dragging(event: MouseEvent): void {
        if (this.target == null) return;
        let currentPosition = {
            x: event.pageX,
            y: event.pageY
        }

        this.isDragging = true;

        let holder = this.holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order,"id",this.target))];
        let holderBoxY = DragDrop.utils.getBoundingClientRect(holder,"y") as number;

        let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
            let element = value as HTMLElement;
            return Number(element.getAttribute("data-ddid")) == this.target;
        }))];
       
        item.style.transform = `translate(${currentPosition.x - (this.initialPosition.x as number)}px,${(holderBoxY - (DragDrop.utils.getBoundingClientRect(this.container,"y") as number)) + currentPosition.y - (this.initialPosition.y as number)}px)`;

        this.collission(holder);
    }

    collission(current: HTMLElement): void {
        let currentBoxY = DragDrop.utils.getBoundingClientRect(current,"y") as number;
        let holders = this.holders;

        for (let i = 0;i < holders.length;i++) {
            let holder = holders[i];
            if (current == holder) continue;
            let holderBox = DragDrop.utils.getBoundingClientRect(holder) as DOMRect;
            let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
                let element = value as HTMLElement;
                return Number(element.getAttribute("data-ddid")) == this.target;
            }))];
            let itemBox = DragDrop.utils.getBoundingClientRect(item) as DOMRect;
            if (Math.abs((holderBox.y + holderBox.height / 2) - (itemBox.y + itemBox.height / 2)) <= itemBox.height / 2) {
       
                this.orderHolder[this.orderName] = DragDrop.utils.insertAt(this.order,DragDrop.utils.getObjectById(this.order,"id",this.target as number),i);
                this.order = this.orderHolder[this.orderName]

                this.initialPosition.y = ((this.initialPosition.y as number) - currentBoxY) + (DragDrop.utils.getBoundingClientRect(holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order,"id",this.target as number))],"y") as number);
                this.updateItems();
            }
        }
    }

    releaseContact(): void {
        if (this.target == null) return;

        let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
            let element = value as HTMLElement;
            return Number(element.getAttribute("data-ddid")) == this.target;
        }))];

        item.style.transition = `transform 0.15s ease-in`;
        item.style.opacity = 1;
        this.target = null;

        function draggingStop(this: DragDrop) {
            this.isDragging = false;
        }
        
        setTimeout(draggingStop.bind(this),150);
        
        this.updateItems();
    }

    init(): void {

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

        const reqr = (event: Event): void => {
            if (this.isDragging)
                event.stopPropagation();
        }

        this.container.addEventListener("mousedown",handleFirstContact,true);
        this.container.addEventListener("click",(event: Event) => reqr(event),true);
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
        },
        getObjectById(container: any[],key: string,value: any) {
            return container.find(element => element[key] == value);
        }
    }
}
