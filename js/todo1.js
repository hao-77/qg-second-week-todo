// DOM元素获取
const elements = {
  Chinese: document.querySelector('.Chinese'),
  English: document.querySelector('.En'),
  submit: document.querySelector('.submit'),
  input: document.querySelector('input'),
  listsUl: document.querySelector('.lists ul'),
  fastTab: document.querySelector('.fast-tab'),
};

// 初始化数据
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentTodos = todos;

// 主渲染函数
function render() {
  elements.listsUl.innerHTML = currentTodos.map((todo, index) => {
    const originalIndex = todos.indexOf(todo);
    return `
          <li class="${todo.completed ? 'finished-li' : ''}" data-index="${originalIndex}">
            <div class="todo-btn ${todo.completed ? 'btn-finished' : ''}">
              ${todo.completed ? '<img src="../img/打勾.svg">' : ''}
            </div>
            <div class="todo-content">${todo.text}</div>
            <div class="todo-btn btn-delete"><img src="../img/叉.svg"></div>
          </li>
        `;
  }).join('');

  // 保存到本地存储
  localStorage.setItem('todos', JSON.stringify(todos));
}

// 事件委托处理
elements.listsUl.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const index = parseInt(li.dataset.index);

  // 处理完成任务
  if (e.target.closest('.todo-btn')) {
    todos[index].completed = !todos[index].completed;
    render();
  }

  // 处理删除任务
  if (e.target.closest('.btn-delete')) {
    todos.splice(index, 1);
    currentTodos = todos;
    render();
  }
});

// 添加新任务
elements.submit.addEventListener('click', () => {
  if (elements.input.value.trim()) {
    todos.unshift({
      text: elements.input.value.trim(),
      completed: false
    });
    currentTodos = todos;
    elements.input.value = '';
    render();
  }
});

// 初始化渲染
render();

elements.fastTab.addEventListener('click', (e) => {
  if (e.target.closest(".all")) {
    currentTodos = todos;
    render();
  } else if (e.target.closest(".finished")) {
    currentTodos = todos.filter(todo => todo.completed);
    render();
  }
});