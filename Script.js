class Theme {
	static dark = "DARK";
	static light = "LIGHT";
}
class TaskState {
	static complete = "COMPLETED";
	static active = "ACTIVE";
}
class Task {
	constructor(taskName, state = TaskState.active, order = 0) {
		this.taskName = taskName;
		this.taskState = state;
		this.order = order;
	}
	changeState = (newState) => {
		this.taskState = newState;
	};
	changeOrder = (newOrder) => {
		this.order = newOrder;
	};
}
class ShowMode {
	static all = "ALL";
	static active = "ACTIVE";
	static completed = "COMPLETED";
}
class TodoList {
	constructor(currTheme) {
		this.todoList = [];
		this.currTheme = currTheme;
		this.currShowMode = ShowMode.all;

		//get input from the form
		const form = document.querySelector("form");
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const textInput = form.querySelector('input[type="text"]');
			let isComplete = form.querySelector('input[type="checkbox"]').checked;
			let taskName = textInput.value.trim();
			if (taskName !== "") {
				let taskState =
					isComplete === true ? TaskState.complete : TaskState.active;
				this.addTask(taskName, taskState);
			} else {
				alert("To do name can't be empty!");
			}
		});

		//activate event listener for navigation
		const allNavs = document.querySelectorAll("ul.task-nav li a");
		allNavs[0].addEventListener("click", this.showAllHandler);
		allNavs[1].addEventListener("click", this.showActiveHandler);
		allNavs[2].addEventListener("click", this.showCompletedHandler);

		//activate event listener for clear completed request
		const clearCompleteBtn = document.querySelectorAll(
			"div.task-action-info span"
		)[1];
		clearCompleteBtn.addEventListener("click", this.clearCompletedHandler);

		//activate item remove and edit event
		const listArea = document.querySelector("ul.task-list");
		listArea.addEventListener("click", (event) => {
			if (event.path[1].className === "task-remove") {
				const li = event.path[1].closest("li");
				//remove commands here
				let index = this._extractIndexFrom(li.id);
				console.log(index);
				this.removeList(index);
			} else if (
				event.path[0].nodeName === "SPAN" &&
				event.path[0].classList.contains("check")
			) {
				const li = event.path[0].closest("li");
				//edit task state commands here
				let index = this._extractIndexFrom(li.id);
				console.log(index);
				this.changeTaskState(index);
			}
		});
	}
	_extractIndexFrom = (text) => {
		return parseInt(text.replace("task-", ""));
	};
	changeTheme(newTheme) {
		this.currTheme = newTheme;
	}
	addTask = (taskName, taskLabel) => {
		let order = this.todoList.length;
		let task = new Task(taskName, taskLabel, order);
		this.todoList.push(task);
		this._renderTasks(this.currShowMode);
	};
	_renderTasks = (showMode = ShowMode.all) => {
		let className = this.currTheme === Theme.dark ? "dark" : "light";
		const taskHost = document.querySelector("ul.task-list");
		taskHost.innerHTML = "";
		this.todoList.sort((a, b) => {
			return a.order - b.order;
		});
		this.todoList.forEach((item) => {
			let skipped = false;
			if (showMode === ShowMode.active) {
				if (item.taskState !== TaskState.active) skipped = true;
			} else if (showMode === ShowMode.completed) {
				if (item.taskState !== TaskState.complete) skipped = true;
			}
			if (!skipped) {
				const newList = document.createElement("li");
				newList.className = className;
				newList.setAttribute("draggable", "true");
				newList.id = `task-${item.order}`;
				let innerHTML = "";
				if (item.taskState === TaskState.complete) {
					innerHTML = `
                <div class="task-change">
                    <span class="check checked"></span>
                    <p class="task-name ${className}">${item.taskName}</p>
                </div>
                <a href="#" class="task-remove">
                    <img src="./images/icon-cross.svg" alt="" />
                </a>
                `;
				} else {
					innerHTML = `
                <div class="task-change">
                    <span class="check"></span>
                    <p class="task-name ${className}">${item.taskName}</p>
                </div>
                <a href="#" class="task-remove">
                    <img src="./images/icon-cross.svg" alt="" />
                </a>                
                `;
				}
				newList.innerHTML = innerHTML;
				taskHost.appendChild(newList);

				//activate drag feature of the list
				newList.addEventListener("dragstart", this._dragStartHandler);
				//activate drop feature to the taskHost
				newList.addEventListener("dragenter", (event) => {
					event.preventDefault();
				});
				newList.addEventListener("dragover", (event) => {
					event.preventDefault();
				});
				newList.addEventListener("drop", (event) => {
					let data = event.dataTransfer.getData("text/plain");
					let dropFromIdx = this._extractIndexFrom(data);
					let dropToIdx = item.order;
					this._reorederList(dropFromIdx, dropToIdx);

					event.preventDefault();
				});
			}
		});

		//render the item left label
		const itemLeftLabel = document.querySelectorAll(
			"div.task-action-info span"
		)[0];
		itemLeftLabel.innerText = `${this.getActiveCount()} items left`;
	};
	_renderActiveNav(index) {
		const allNavs = document.querySelectorAll("ul.task-nav li a");
		allNavs.forEach((item) => {
			item.removeAttribute("class");
		});
		allNavs[index].setAttribute("class", "selected");
	}
	showAllHandler = () => {
		this._renderTasks();
		this.currShowMode = ShowMode.all;
		this._renderActiveNav(0);
	};
	showActiveHandler = () => {
		this._renderTasks(ShowMode.active);
		this.currShowMode = ShowMode.active;
		this._renderActiveNav(1);
	};
	showCompletedHandler = () => {
		this._renderTasks(ShowMode.completed);
		this.currShowMode = ShowMode.completed;
		this._renderActiveNav(2);
	};
	getActiveCount = () => {
		const allActive = this.todoList.filter((item, index) => {
			return item.taskState === TaskState.active;
		});
		return allActive.length;
	};

	_reindexing = () => {
		let idx = 0;
		this.todoList.forEach((item, index) => {
			this.todoList[index].changeOrder(idx);
			idx++;
		});
	};
	removeList = (index) => {
		this.todoList.splice(index, 1);
		this._reindexing();
		this._renderTasks(this.currShowMode);
	};
	changeTaskState = (index) => {
		let newState =
			this.todoList[index].taskState === TaskState.active
				? TaskState.complete
				: TaskState.active;
		this.todoList[index].changeState(newState);
		this._renderTasks(this.currShowMode);
	};
	clearCompletedHandler = () => {
		this.todoList = this.todoList.filter((item, index) => {
			return item.taskState !== TaskState.complete;
		});
		this._reindexing();
		this._renderTasks(this.currShowMode);
	};
	_reorederList = (from, to) => {
		if (from < to) {
			this.todoList[from].changeOrder(-1);
			for (let index = from + 1; index <= to; index++) {
				let newOrder = index - 1;
				this.todoList[index].changeOrder(newOrder);
			}
			this.todoList[from].changeOrder(to);
		} else if (from > to) {
			this.todoList[from].changeOrder(-1);
			for (let index = from - 1; index >= to; index--) {
				let newOrder = index + 1;
				this.todoList[index].changeOrder(newOrder);
			}
			this.todoList[from].changeOrder(to);
		}
		this._renderTasks(this.currShowMode);
	};
	_dragStartHandler = (event) => {
		event.dataTransfer.setData("text/plain", event.target.id);
		event.dataTransfer.effectAllowed = "move";
		console.log("drag start on element: " + event.target.id);
	};
}
class App {
	constructor(theme) {
		this._activateTheme(theme);

		//activate event listener for theme switch
		const btnSwitchTheme = document.querySelector("a.switch-theme-btn");
		btnSwitchTheme.addEventListener("click", () => {
			this.changeTheme();
		});

		//Activate To Do List Functionality
		this.todoList = new TodoList();
		//Try add tasks to the new todoList
		this.todoList.addTask("Complete online JS course", TaskState.complete);
		this.todoList.addTask("Jog arround the park 3x", TaskState.active);
		this.todoList.addTask("10 Menutes meditation", TaskState.active);
		this.todoList.addTask("Coooking pasta for diner!", TaskState.complete);
		this.todoList.addTask("Complete a JS Project!S", TaskState.complete);
		//Try render the added tasks
		this.todoList.changeTheme(theme);
		this.todoList.showAllHandler();
	}
	_activateTheme = (theme) => {
		/* List of elements with theme class that need to be change */
		const components = [];
		const body = document.querySelector("body");
		const header = document.querySelector("header");

		const formAdd = document.querySelector("form");

		const taskWrapper = document.querySelector("div.task-wrapper");
		const taskLists = taskWrapper.querySelectorAll("ul.task-list li");
		console.log(taskLists);
		const taskActionInfo = taskWrapper.querySelector("div.task-action-info");
		const taskNav = taskActionInfo.querySelector("ul");

		components.push(body);
		components.push(header);
		components.push(formAdd);
		components.push(taskWrapper);
		components.push(taskActionInfo);
		components.push(taskNav);
		// get switch theme button Image
		const btnSwitchThemeImage = document.querySelector(
			"a.switch-theme-btn img"
		);

		if (theme === Theme.dark) {
			components.forEach((comp) => {
				comp.classList.remove("light");
				comp.classList.add("dark");
			});
			taskLists.forEach((comp) => {
				comp.classList.remove("light");
				comp.classList.add("dark");
			});
			btnSwitchThemeImage.src = "./images/icon-sun.svg";
			this.theme = Theme.dark;
		} else {
			components.forEach((comp) => {
				comp.classList.remove("dark");
				comp.classList.add("light");
			});
			taskLists.forEach((comp) => {
				comp.classList.remove("dark");
				comp.classList.add("light");
			});
			btnSwitchThemeImage.src = "./images/icon-moon.svg";
			this.theme = Theme.light;
		}
	};
	changeTheme = () => {
		if (this.theme === Theme.dark) {
			this._activateTheme(Theme.light);
		} else {
			this._activateTheme(Theme.dark);
		}
		this.todoList.changeTheme(this.theme);
	};
}

_app = new App(Theme.dark);
