var TodoApi = function() {
    this.path = '/api/todos/';
};

TodoApi.prototype.add = function(text) {
     return fetch(this.path, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text: text
		})
	});
};

TodoApi.prototype.edit = function(id, text) {
    console.log('Edit ', id, text)
    return fetch(this.path + id, {
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text: text
		})
	});
};


TodoApi.prototype.delete = function(id) {
    console.log('id');
    return fetch(this.path + id, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
	});
};

TodoApi.prototype.getAll = function() {
    return fetch(this.path);
};


var todoAPI = new TodoApi();
var socket = io();

var $$addTodoBtn = document.getElementById('add-todo');
var $$todoText = document.getElementById('todo-text');
var $$todoList = document.getElementById('todo-list');
var $$errors = document.getElementById('errors');

var todoItems = [];

var socket = io.connect('http://localhost:3000');


todoAPI.getAll().then(function(response){
	if(response.ok) {
		return response.json();
	} 
}).then(function(todos){
     todoItems = todos;
     renderTodoList();
});




bindEventListeners();
bindSocketEventListeners();

function bindSocketEventListeners() {
    socket.on('todo:deleted', function (data) {
        console.log('todo:deleted', data);
         for(var i = 0; i< todoItems.length; i++){
            if (todoItems[i].id === data.id) {
                todoItems.splice(i, 1);
                break;
            }
        }
        document.getElementById(data.id).remove();
        console.log('removeTodoItem', todoItems);
    });

    socket.on('todo:updated', function (data) {
        console.log('todo:updated', data);
        for(var i = 0; i < todoItems.length; i++){
            if (todoItems[i].id === data.id) {
                todoItems[i] = data;
                break;
            }
        }
       
        document.getElementById(data.id).querySelector('.todo-text').value = data.text;
        console.log('updateTodoItem', todoItems);
    });


    socket.on('todo:created', function (data) {
        console.log('todo:created', data);
        todoItems.push(data);
        $$todoList.appendChild(renderTodoItem(data));
    });
}


function bindEventListeners(){
	$$addTodoBtn.addEventListener('click', function(){
        var text = $$todoText.value;
        $$todoText.value = "";
		todoAPI.add(text).then(function(response){
            console.log("response ",response);
            if (response.ok) {
               return response.json();
            } else if (response.status === 400) {
                response.json().then(function(data) {
                    $$errors.innerHTML = data.error.message;
                })
            }
        }).then(function(todo){
            todoItems.push(todo);
            console.log("add new tod ",todo)
        });
	});

    $$todoList.addEventListener('click', function(event){
        if (event.target.className === 'save-todo'){
			var todoItemHolder = event.target.parentNode;
			var id = todoItemHolder.id;
            var textArea = todoItemHolder.querySelector(".todo-text");
            var text = textArea.value;
            todoAPI.edit(id, text).then(function(response){
                console.log("response ",response);
                if (response.status === 400) {
                    response.json().then(function(data) {
                        $$errors.innerHTML = data.error.message;
                        for(var i = 0; i< todoItems.length; i++){
                            if (todoItems[i].id === id) {
                                textArea.value = todoItems[i].text;
                                break;
                            }
                        }
                    });
                }
            });
		} else if (event.target.className === 'delete-todo'){
			var todoItemHolder = event.target.parentNode;
			var id = todoItemHolder.id;
			todoAPI.delete(id).then(function(response){
				if(response.ok) {
					return;
				} 
			}).then(function(){
			});
		}
    });
    

}


function renderTodoItem(data) {
    var $todoItemHolder = document.createElement('div');
	$todoItemHolder.className = 'todo-item';

	if (data.id){
		$todoItemHolder.id = data.id
	}

	var $text = document.createElement('textarea');
	$text.value = data.text;
	$text.className = 'todo-text'
	$todoItemHolder.appendChild($text);

	var $saveBtn = document.createElement('button');
	$saveBtn.innerText = 'Save';
	$saveBtn.className = 'save-todo'
	$todoItemHolder.appendChild($saveBtn);

	var $deleteBtn = document.createElement('button');
	$deleteBtn.innerText = 'Delete';
	$deleteBtn.className = 'delete-todo'
	$todoItemHolder.appendChild($deleteBtn);
	return $todoItemHolder; 
}

function renderTodoList(){
    todoItems.forEach(function(item){
        $$todoList.appendChild(renderTodoItem(item))
    });
}