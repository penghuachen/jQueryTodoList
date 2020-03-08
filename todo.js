
// index: 使陣列中的資料位置與 DOM 的節點位置同步，刪除、選取才不會有問題
// id: 資料的唯一性，目前用於判斷狀態切換時，同步更新當前狀態陣列、更新原陣列


$(document).ready(function () {
  const todoTasksList =  JSON.parse(localStorage.getItem('storeTodoTasksList')) || [];
  let currentStatus = '全部';
  const DELETEICON = `
    <div data-testid="delete-icon" class="delete-icon">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash-alt" class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z">
        </path>
      </svg>
    </div> 
  `;

  renderTaskList();
  $('.refresh').on('click', deleteAllTasks);
  $('.task-status p').on('click', changeStatus);

  $('.plus').on('click', () => {
    addTask();
  });

  $('.input-task input').on('keypress', e => {
    if(e.keyCode === 13) {
      addTask();
    } 
  });

  // 每次重新建立 DOM 物件時替 DOM 元素掛上監聽事件
  function addListenerToTask() {
    // console.log('add listener');
    $('.delete-icon') 
      .on('click', deleteTask);

    $('.undone')
      .on('click', completeTask);

    $('.done')
      .on('click', cancelCompletedTask); 

    $('.task-content')
      .on('dblclick', openEditInput); 

    $('.editTask')
      .on('keyup', updateTaskContent)
      .on('blur', updateTaskContent)
  }

  function idGenerator() {
    return new Date().getTime();
  }

  function addTask(e) {
    // console.log('add');
    let inputTask = $('.input-task input').val();
    if(inputTask === '') return;
    let taskObj = {
      id: idGenerator(),
      done: false,
      edit: false,
      task: inputTask
    };
    todoTasksList.push(taskObj);
    $('.input-task input').val('');
    localStorage.setItem('storeTodoTasksList', JSON.stringify(todoTasksList));
    renderTaskList();
  }

  function deleteTask(e) {
    let targetId = $( this )
                .parent()
                .attr('id');
    let targetObj  = todoTasksList.find(task => task.id == targetId);
    let taskIndex = todoTasksList.indexOf(targetObj);
    todoTasksList.splice(taskIndex, 1)
    localStorage.setItem('storeTodoTasksList', JSON.stringify(todoTasksList));
    renderTaskList()
  }

  function deleteAllTasks(e) {
    // console.log('refresh');
    if(todoTasksList.length === 0) {
      return alert('目前沒有任何待辦事項');
    }

    let deleteChecked = confirm('你確定要刪除全部待辦事項嗎?');
    if(deleteChecked) {
      alert('成功刪除所有待辦事項');
      todoTasksList.splice(0);
      renderTaskList();
      localStorage.setItem('storeTodoTasksList',JSON.stringify(todoTasksList));
    }
    else {
      alert('取消刪除所有待辦事項');
    }
  }

  function completeTask(e) {
    let targetId = $( this )
                .parent()
                .attr('id');
    let targetObj  = todoTasksList.find(task => task.id == targetId);
    targetObj.done = true
    localStorage.setItem('storeTodoTasksList',JSON.stringify(todoTasksList));
    renderTaskList();;
  }

  function cancelCompletedTask(e) {
    // 更新資料狀態
    let targetId = $( this )
                .parent()
                .attr('id');
    let targetObj  = todoTasksList.find(task => task.id == targetId)
    targetObj.done = false;
    localStorage.setItem('storeTodoTasksList',JSON.stringify(todoTasksList));
    renderTaskList()
  }

  function openEditInput(e) { 
    let targetId = $( this )
    .parent()
    .attr('id');
    let targetObj  = todoTasksList.find(task => task.id == targetId);
    targetObj.edit = true;
    renderTaskList()
  }

  function updateTaskContent(e) {
    // console.log('update');
    if(e.keyCode === 13 || e.type === 'blur') {
      let newValue = $( this ).val();
      let targetId = $( this )
                .parent()
                .parent()
                .attr('id');
      let targetObj  = todoTasksList.find(task => task.id == targetId);
      targetObj.task = newValue;
      targetObj.edit = false;
      renderTaskList()
    }
  }

  function changeStatus(e) {
    $( this )
      .addClass('current')
      .siblings()
      .removeClass('current');

    currentStatus = $( this ).text();
    renderTaskList()
  }
  // 勾選任務狀態後，重新渲染該狀態時的畫面
  function filterTasks(currentStatus) { 
    if(currentStatus === '進行中') {
      return todoTasksList
              .filter(task => task.done === false);
    }
    if(currentStatus === '已完成') {
      return todoTasksList
              .filter(task => task.done === true);
    }
    return todoTasksList;
  }



  function statusIconGenerator(taskStatus) { 
    // 透過模板字串搭配三元運算子動態修改css display / class 的值
    const undoneIcon = `<div data-testid="undone" class="undone"></div>`;
    const doneIcon = `
    <div data-testid="done" class="done">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" class="svg-inline--fa fa-check fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="white" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z">
        </path>
      </svg>
    </div>`;
    return taskStatus ? doneIcon : undoneIcon;
  }
  
  function checkEditStatus(content, editStatus) { 
    return `
      <p style="display:${ !editStatus ? 'block' : 'none' }">${ content }</p>
      <input 
        data-testid="editTask" 
        type="text" 
        class="editTask" 
        value=${ content }
        style="display:${ editStatus ? 'block' : 'none' }"
      >
    `
  }
  
  function taskContentGenerator(taskStatus, taskContent, editStatus) { 
    return `
      <div data-testid="task-content" class="task-content ${ taskStatus ? 'line-through' : '' }">
        ${ checkEditStatus(taskContent, editStatus) }
      </div>`;
  }
  
  function taskElementsGenerator(obj) { 
    return `
      <div class="task" id="${ obj.id }">
        ${ statusIconGenerator(obj.done) }
        ${ taskContentGenerator(obj.done, obj.task, obj.edit) }
        ${ DELETEICON }
      </div>
    `;
  }
  
  // 任務列表畫面
  function renderTaskList() {
    const taskListView = document.querySelector('.task-list');
    const getFilterTasks = filterTasks(currentStatus);
    taskListView.innerHTML = getFilterTasks
                              .map(obj => taskElementsGenerator(obj))
                              .join('');
    addListenerToTask();
  }


  // 取得日期
  (function getDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'October', 'November', 'December'];
    let currentDay = new Date().getDay();
    let currentMonth = new Date().getMonth();
    let currentDate = new Date().getDate();

    let dom = `${ days[currentDay] }, ${ months[currentMonth].substring(0,3) } ${ currentDate }`;
    $('.date')
      .html(dom);
  })();

});

