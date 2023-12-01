class DragDrop {
    container: HTMLElement;
    target: null | number;
    initialPosition: Record<string,null | number>;
    items: any;
    holders: any;
    isDragging: boolean;
    order: any[];

    constructor(container: HTMLElement,order: any[]) {
        this.container = container;
        this.target = null;
        this.initialPosition = {
            x : null,
            y : null
        };
        this.items = this.holders;
        this.isDragging = false;
        this.order = order; 
    }

    // make the holder for the items
    /*
      It will make a holder with the same size as theh item and  add the item margin,
      to place them correctly as the previous position of the item,
      then add them in the container element to replace the item.

      we assign the this.holders to the holder that we created.
    */
    makeHolders(): void {
        let items = this.items;
        let getRect = DragDrop.utils.getBoundingClientRect;
        for (let i = 0;i < items.length;i++) {
            let holder = document.createElement("div");
            holder.className = "holder";

            let {width,height} = getRect(items[i]) as DOMRect;
            let containerBox = getRect(this.container) as DOMRect;
            
            holder.style.cssText = `
                background-color: rgba(0,0,0,0.04);
                margin: ${getComputedStyle(items[i]).margin};
                width: ${width}px;
                height: ${height}px;
            `;

            this.container.appendChild(holder);
        }
        this.holders = this.container.querySelectorAll(".holder");
    }
    
    // remove all the holders that we have created
    removeHolders(): void {
        let holders = this.container.querySelectorAll(".holder");
        for (let i = 0;i < holders.length;i++) {
            let holder = holders[i];
            holder.remove();
        }
    }   
    
    // preparing our items
    /*
     First we remove all the holders that we created because we are going to create new ones,
     we get all the children in our container element ( they will be our item) and them a class,
     me make their display flow out of the dom by adding position absolute,
     then asign them to this.items for the holder that we are going to create to get them,
     then we make the holders, then position the items to the holder.
        
     it is not necessarily to remove the holders in the app that I createad,
     since in the index.ts it already removed it for us,
     but I think of these two files as independent so I remove it still.
    */
    setItems(): void {
        this.removeHolders();
        
        let childrens = this.container.children;         
        for (let i = 0;i < childrens.length;i++) {
            let children = childrens[i] as HTMLElement;
            children.classList.add("dd-item");
            children.style.position = "absolute";
        }
        
        this.items = this.container.querySelectorAll(".dd-item") as NodeListOf<Element>;
        this.makeHolders();

        let items = this.items;
        let holders = this.holders;
        for (let i = 0;i < items.length;i++) {
            let item = items[i];
            item.setAttribute("data-ddid",this.order[i].id);
           
            let holder = holders[i];
            
            item.style.margin = '0';
            item.style.transition = "0s";

            this.positionItem(item,holder);
            
            //for some reason the transition is applied before the translate end,
            //so we can see transition, but what I want is to place the items first,
            //before we can have the transition (the transition is for every time we moved the element,
            //in dragging).
            setTimeout(() => {
                item.style.transition = `transform 0.15s ease-in`;
            },150);
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
            if (current_element.classList.contains("dd-item")) break;
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

        let item = Array.from(this.items).find(value => {
            let element = value as HTMLElement;
            return Number(element.getAttribute("data-ddid")) == this.target;
        }))];
       
        item.style.transform = `translate(${currentPosition.x - (this.initialPosition.x as number)}px,${(holderBoxY - (DragDrop.utils.getBoundingClientRect(this.container,"y") as number)) + currentPosition.y - (this.initialPosition.y as number)}px)`;

        this.collission(holder,item);
    }

    // collission will detect where we will put the next item
    /*
       Look for holders where the item we are dragging are on top of it,
       by half of its size then update the order indexes if we found one
       update the item (that we are dragging) order by that match index
    */
    collission(current: HTMLElement,item: HTMLElement): void {
        let {getObjectById, getBoundingClientRect, insertAt} = DragDrop.utils;
        let getRect = getBoundingClientRect;
        let getId = getObjectById;

        let currentBoxY = getRect(current,"y") as number;
        let holders = this.holders;

        for (let i = 0;i < holders.length;i++) {
            let holder = holders[i];

            if (current == holder) continue;
            let holderBox = getRect(holder) as DOMRect;

            let itemBox = getRect(item) as DOMRect;

            if (Math.abs((holderBox.y + holderBox.height / 2) - (itemBox.y + itemBox.height / 2)) <= itemBox.height / 2) {
                const targetItem = DragDrop.utils.getObjectById(this.order,"id",this.target as number);
                insertAt(this.order,targetitem,i);
                this.initialPosition.y = ((this.initialPosition.y as number) - currentBoxY) + (getRect(holders[this.order.indexOf(getId(this.order,"id",this.target as number))],"y") as number);
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
    
    // set the position of the item to its holder
    positionItem(item: HTMLElement, holder: HTMLElement): void {
        let getRect = DragDrop.utils.getBoundingClientRect;
        let holderBoxY = getRect(holder,"y") as number;
        let containerBoxY = getRect(this.container,"y") as number;
        let yDelta = holderBoxY - containerBoxY;

        item.style.transform = `translateY(${yDelta}px)`;
    } 

    init(): void {
        
        this.container.style.cssText = `
            display: flex;
            flex-direction: column;
            position: relative;
        `;

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
        // insert the element depend on the "to" index
        // if the "to" is lesser than the index of target we move the target up otherwise down
        insertAt: function(array: number[],target: number,to: number): void {
            let initial_index = array.indexOf(target);
            let temp = array[initial_index];
            array[initial_index] = to;
            array[to] = temp;
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
