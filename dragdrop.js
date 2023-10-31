"use strict";
class DragDrop {
    constructor(container, orderHolder, orderName) {
        this.container = container;
        this.target = null;
        this.initialPosition = {
            x: null,
            y: null
        };
        this.items = this.holders;
        this.isDragging = false;
        this.orderHolder = orderHolder;
        this.order = orderHolder[orderName];
        this.orderName = orderName;
    }
    makeHolders() {
        let items = this.items;
        for (let i = 0; i < items.length; i++) {
            let holder = document.createElement("div");
            holder.className = "holder";
            let { top, left, width, height } = DragDrop.utils.getBoundingClientRect(items[i]);
            let containerBox = DragDrop.utils.getBoundingClientRect(this.container);
            holder.style.backgroundColor = "rgba(0,0,0,.04)";
            holder.style.margin = getComputedStyle(items[i]).margin;
            holder.style.width = width + "px";
            holder.style.height = height + "px";
            holder.style.top = `translate(${left - containerBox.x}px,${top - containerBox.y}px)`;
            this.container.appendChild(holder);
        }
        this.holders = this.container.querySelectorAll(".holder");
    }
    removeHolders() {
        let holders = this.container.querySelectorAll(".holder");
        for (let i = 0; i < holders.length; i++) {
            let holder = holders[i];
            holder.remove();
        }
    }
    setItems() {
        this.removeHolders();
        let childrens = this.container.children;
        for (let i = 0; i < childrens.length; i++) {
            let children = childrens[i];
            children.classList.add("item");
            children.style.position = "absolute";
            children.style.transition = "transform 0s";
        }
        this.items = this.container.querySelectorAll(".item");
        this.makeHolders();
        let items = this.items;
        let holders = this.holders;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.setAttribute("data-ddid", this.order[i].id);
            let holder = holders[i];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container, "y");
            item.style.margin = '0';
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
            setTimeout(() => {
                item.style.transition = `transform 0.15s ease-in`;
            });
        }
    }
    updateItems() {
        let items = this.items;
        let holders = this.holders;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let index = Number(item.getAttribute("data-ddid"));
            if (this.target == index)
                continue;
            let holder = holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order, "id", index))];
            let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
            let containerBoxY = DragDrop.utils.getBoundingClientRect(this.container, "y");
            item.style.transform = `translateY(${holderBoxY - containerBoxY}px)`;
        }
    }
    firstContact(event) {
        let eventTarget = event.target;
        let current_element = event.target;
        while (current_element != document.body) {
            if (current_element.classList.contains("item")) {
                break;
            }
            current_element = current_element.parentElement;
        }
        let target = current_element.getAttribute("data-ddid");
        if (target == null || !current_element.classList.contains("item"))
            return;
        let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find((value) => {
            let element = value;
            return element.getAttribute("data-ddid") == target;
        }))];
        item.style.transition = "transform 0s";
        this.target = Number(target);
        let { pageX, pageY } = event;
        this.initialPosition = {
            x: pageX,
            y: pageY
        };
    }
    dragging(event) {
        if (this.target == null)
            return;
        let currentPosition = {
            x: event.pageX,
            y: event.pageY
        };
        this.isDragging = true;
        let holder = this.holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order, "id", this.target))];
        let holderBoxY = DragDrop.utils.getBoundingClientRect(holder, "y");
        let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
            let element = value;
            return Number(element.getAttribute("data-ddid")) == this.target;
        }))];
        item.style.transform = `translate(${currentPosition.x - this.initialPosition.x}px,${(holderBoxY - DragDrop.utils.getBoundingClientRect(this.container, "y")) + currentPosition.y - this.initialPosition.y}px)`;
        this.collission(holder);
    }
    collission(current) {
        let currentBoxY = DragDrop.utils.getBoundingClientRect(current, "y");
        let holders = this.holders;
        for (let i = 0; i < holders.length; i++) {
            let holder = holders[i];
            if (current == holder)
                continue;
            let holderBox = DragDrop.utils.getBoundingClientRect(holder);
            let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
                let element = value;
                return Number(element.getAttribute("data-ddid")) == this.target;
            }))];
            let itemBox = DragDrop.utils.getBoundingClientRect(item);
            if (Math.abs((holderBox.y + holderBox.height / 2) - (itemBox.y + itemBox.height / 2)) <= itemBox.height / 2) {
                this.orderHolder[this.orderName] = DragDrop.utils.insertAt(this.order, DragDrop.utils.getObjectById(this.order, "id", this.target), i);
                this.order = this.orderHolder[this.orderName];
                this.initialPosition.y = (this.initialPosition.y - currentBoxY) + DragDrop.utils.getBoundingClientRect(holders[this.order.indexOf(DragDrop.utils.getObjectById(this.order, "id", this.target))], "y");
                this.updateItems();
            }
        }
    }
    releaseContact() {
        if (this.target == null)
            return;
        let item = this.items[Array.from(this.items).indexOf(Array.from(this.items).find(value => {
            let element = value;
            return Number(element.getAttribute("data-ddid")) == this.target;
        }))];
        item.style.transition = `transform 0.15s ease-in`;
        item.style.opacity = 1;
        this.target = null;
        function draggingStop() {
            this.isDragging = false;
        }
        setTimeout(draggingStop.bind(this), 150);
        this.updateItems();
    }
    init() {
        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.position = "relative";
        this.setItems();
        const handleFirstContact = (event) => {
            event.stopPropagation();
            this.firstContact(event);
        };
        const handleDragging = (event) => {
            this.dragging(event);
            event.stopPropagation();
        };
        const handleReleaseContact = (event) => { event.stopPropagation(); this.releaseContact(); };
        const reqr = (event) => {
            if (this.isDragging)
                event.stopPropagation();
        };
        this.container.addEventListener("mousedown", handleFirstContact, true);
        this.container.addEventListener("click", (event) => reqr(event), true);
        this.container.addEventListener("mousemove", handleDragging, true);
        window.addEventListener("mouseup", handleReleaseContact, true);
    }
}
DragDrop.utils = {
    insertAt: function (array, target, to) {
        let initial_index = array.indexOf(target);
        if (initial_index < to) {
            return array.slice(0, initial_index).concat(array.slice(initial_index + 1, to + 1)).concat([target]).concat(array.slice(to + 1, array.length));
        }
        else if (initial_index > to) {
            return array.slice(0, to).concat([target]).concat(array.slice(to, initial_index)).concat(array.slice(initial_index + 1, array.length));
        }
    },
    getBoundingClientRect: function (target, ...properties) {
        let rect = target.getBoundingClientRect();
        if (properties.length == 1) {
            return rect[properties[0]];
        }
        else if (!properties || properties.length == 0)
            return rect;
        let result = {};
        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];
            result[property] = rect[property];
        }
        return result;
    },
    getObjectById(container, key, value) {
        return container.find(element => element[key] == value);
    }
};
