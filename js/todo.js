
// DOM元素获取
const elements = {
  Chinese: document.querySelector('.Chinese'),
  English: document.querySelector('.En'),
  submit: document.querySelector('.submit'),
  input: document.querySelector('.header-input input'),
  listsUl: document.querySelector('.lists ul'),
  fastTab: document.querySelector('.fast-tab'),
  btnEn: document.querySelector('.btn-en'),
  btnZh: document.querySelector('.btn-zh')
};

// 状态管理对象
const state = {
  todos: JSON.parse(localStorage.getItem('todos')) || [],
  deletedTodos: JSON.parse(localStorage.getItem('deletedTodos')) || [],
  currentView: 'all',
  shortcutOpen: true,
  darkMode: false,
  lang: localStorage.getItem('lang') || 'zh',
  searchText: '',

  // 初始化唯一ID
  initData() {
    this.todos = this.todos.map(t => ({
      ...t,
      id: t.id || Date.now() + Math.random(),
      createdAt: t.createdAt || Date.now(),
      completedAt: t.completed ? (t.completedAt || Date.now()) : null
    }));

    this.deletedTodos = this.deletedTodos.map(t => ({
      ...t,
      id: t.id || Date.now() + Math.random(),
      createdAt: t.createdAt || Date.now(),
      completedAt: t.completed ? (t.completedAt || Date.now()) : null
    }));
  },

  // 获取当前视图数据
  get currentTodos() {
    switch (this.currentView) {
      case 'finished':
        return this.todos.filter(t => t.completed);
      case 'unfinished':
        return this.todos.filter(t => !t.completed);
      case 'trash':
        return this.deletedTodos;
      default:
        return this.todos;
    }
  },

  // 添加翻译映射
  translations: {
    zh: {
      about: '关于我',
      open: '开',
      close: '关',
      inProgress: '进行中',
      completed: '已完成',
      trash: '回收站',
      finishAll: '全部标为已完成',
      clearFinished: '清除已完成',
      clearAll: '清除全部',
      export: '导出数据',
      import: '导入(txt/json)',
      all: '全部',
      createTime: '创建：',
      emptyTips: [
        '添加你的第一个待办事项！📝',
        '食用方法💡：',
        '✔️ 所有提交操作支持Enter回车键提交📝',
        '✔️ 拖拽Todo上下移动可排序(仅支持PC)',
        '✔️ 双击上面的标语和 Todo 可进行编辑',
        '✔️ 右侧的小窗口是快捷操作哦',
        '🔒 所有的Todo数据存储在浏览器本地',
        '📝 支持下载和导入，导入追加到当前序列'
      ]
    },
    en: {
      about: 'About',
      open: 'Open',
      close: 'Close',
      inProgress: 'In Progress',
      completed: 'Completed',
      trash: 'Trash',
      finishAll: 'Finish all',
      clearFinished: 'Clear finished',
      clearAll: 'Clear all',
      export: 'Export data',
      import: 'Import(txt/json)',
      all: 'All',
      createTime: 'Created: ',
      emptyTips: [
        'Add your first todo!📝',
        'Usage tips💡:',
        '✔️ All submissions support Enter key📝',
        '✔️ Drag to sort todos (PC only)',
        '✔️ Double click header or todo to edit',
        '✔️ Right panel shows quick actions',
        '🔒 All data stored locally in browser',
        '📝 Support export/import (append mode)'
      ]
    }
  },

  // 添加翻译方法
  t(key) {
    return this.translations[this.lang][key] || key;
  }
};


// 添加时间格式化函数
function formatTime(timestamp) {
  if (!timestamp) return '未完成';
  const date = new Date(timestamp);

  return `${date.toLocaleString()}`
}
// 初始化数据
state.initData();

// 主渲染函数
function render() {
  // 控制快捷栏开关状态
  if (elements.btnEn) {
    elements.btnEn.style.color = state.lang === 'en' ? '#000' : '#666';
    elements.btnEn.style.fontWeight = state.lang === 'en' ? '600' : '400';
  }
  if (elements.btnZh) {
    elements.btnZh.style.color = state.lang === 'zh' ? '#000' : '#666';
    elements.btnZh.style.fontWeight = state.lang === 'zh' ? '600' : '400';
  }

  elements.fastTab.classList.toggle('closed', !state.shortcutOpen);

  // 渲染任务列表
  elements.listsUl.innerHTML = state.currentTodos.map(todo => `
    <li class="${todo.completed ? 'finished-li' : ''}" data-id="${todo.id}">
      <div class="todo-btn ${todo.completed ? 'btn-finished' : ''}">
        ${todo.completed ? '<img src="../img/打勾.svg">' : ''}
      </div>
      <div class="todo-content">
        <div class="todo-text">${todo.text}</div>
        <div class="time-info">
          <span>${state.t('createTime')}${formatTime(todo.createdAt)}</span>
          ${todo.completed ?
      `<span>${state.t('completed')}：${formatTime(todo.completedAt)}</span>` :
      `<span class="unfinished-tag">${state.t('inProgress')}</span>`}
        </div>
      </div>
      <div class="todo-btn ${state.currentView === 'trash' ? 'btn-restore' : 'btn-delete'}">
        <img src="${state.currentView === 'trash' ? '../img/回退.svg' : '../img/叉.svg'}">
      </div>
    </li>
  `).join('');

  // 视图显示控制逻辑
  const viewStatus = {
    'all': true,
    'unfinished': state.todos.some(t => !t.completed),
    'finished': state.todos.some(t => t.completed),
    'trash': state.deletedTodos.length > 0
  };

  // 处理快捷标签显示
  document.querySelectorAll('.fast-tab li').forEach(item => {
    const viewType = ['all', 'unfinished', 'finished', 'trash'].find(v =>
      item.classList.contains(v)
    );

    // 初始显示设置
    let shouldDisplay = viewStatus[viewType] ?? true;
    item.style.display = shouldDisplay ? 'block' : 'none';

    // 处理快捷开关关闭状态
    if (!state.shortcutOpen) {
      if (viewType === 'all') {
        item.textContent = state.lang === 'zh' ? '快\n捷\n开\n关' : 'Shortcut';
        // item.style.writingMode = 'vertical-lr';
      } else {
        item.style.display = 'none';
        // item.style.writingMode = 'none';
      }
    } else {
      if (viewType === 'all') {
        item.textContent = state.t('all');
        item.style.writingMode = 'horizontal-tb';
      } else {
        // 新增翻译映射
        const labelMap = {
          unfinished: 'inProgress',
          finished: 'completed',
          trash: 'trash'
        };
        item.textContent = state.t(labelMap[viewType]);
      }
    }
  });

  // 更新激活状态
  document.querySelectorAll('.fast-tab li').forEach(item => {
    item.classList.remove('active');
    const viewType = ['all', 'unfinished', 'finished', 'trash'].find(v =>
      item.classList.contains(v)
    );
    if (viewType === state.currentView && item.style.display !== 'none') {
      item.classList.add('active');
    }
  });

  // 更新顶部按钮
  // document.querySelector('.container-top-left span').textContent = state.t('about');
  document.querySelector('.switch').textContent = state.shortcutOpen ?
    state.t('open') :
    state.t('close');
  // 控制功能按钮显示
  const isMainView = ['all', 'unfinished', 'finished'].includes(state.currentView);
  const hasTodos = state.todos.length > 0;
  const hasCompleted = state.todos.some(t => t.completed);

  // 操作按钮文本和显示控制
  const controlButtons = {

    '.all-mark-finished': {
      text: state.t('finishAll'),
      show: hasTodos
    },
    '.cls-finished': {
      text: state.t('clearFinished'),
      show: hasCompleted
    },
    '.cls-all': {
      text: state.t('clearAll'),
      show: hasTodos
    },
    '.out-data': {
      text: state.t('export'),
      show: true
    },
    '.in-data': {
      text: state.t('import'),
      show: true
    }
  };

  Object.entries(controlButtons).forEach(([selector, config]) => {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.textContent = config.text;
      btn.style.display = isMainView && config.show ? 'block' : 'none';
    }
  });

  // 空状态提示
  if (isMainView && !hasTodos) {
    elements.listsUl.innerHTML = `
      <div class="empty-tips">
        ${state.t('emptyTips').map(text => `<p>${text}</p>`).join('')}
      </div>`;
  }

  // 持久化存储
  localStorage.setItem('todos', JSON.stringify(state.todos));
  localStorage.setItem('deletedTodos', JSON.stringify(state.deletedTodos));
  localStorage.setItem('lang', state.lang); // 保存语言状态
}

// 事件委托处理任务操作
elements.listsUl.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const todoId = Number(li.dataset.id);
  const todo = [...state.todos, ...state.deletedTodos].find(t => t.id === todoId);

  // 完成任务
  if (e.target.closest('.todo-btn:not(.btn-delete):not(.btn-restore)')) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? Date.now() : null; // 新增时间记录
    render();
  }
  if (e.target.closest('.btn-restore')) {
    if (state.currentView === 'trash') {
      // 从回收站移回主列表
      state.todos.unshift(todo);
      state.deletedTodos = state.deletedTodos.filter(t => t.id !== todoId);
      render();
    }
    return;
  }

  // 删除任务
  if (e.target.closest('.btn-delete')) {
    if (state.currentView === 'trash') {
      // 从回收站永久删除
      state.deletedTodos = state.deletedTodos.filter(t => t.id !== todoId);
    } else {
      // 移到回收站
      state.deletedTodos.push(todo);
      state.todos = state.todos.filter(t => t.id !== todoId);
    }
    render();
  }

});

// 添加新任务
elements.submit.addEventListener('click', () => {
  const text = elements.input.value.trim();
  if (!text) return;

  state.todos.unshift({
    id: Date.now() + Math.random(),
    text,
    completed: false,
    createdAt: Date.now(), // 记录创建时间
    completedAt: null
  });

  elements.input.value = '';
  render();
});
elements.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    elements.submit.click();
  }
})

// 快速分类处理
elements.fastTab.addEventListener('click', (e) => {
  // 视图切换
  const viewTypes = ['all', 'unfinished', 'finished', 'trash'];
  const newView = viewTypes.find(view => e.target.closest(`.${view}`));
  if (e.target.closest('.switch')) {
    state.shortcutOpen = !state.shortcutOpen;
    // document.querySelector('.switch').textContent =
    //   state.shortcutOpen ? state.t('open') : state.t('close');
    // // state.darkMode = !state.darkMode; 
    // const switchButton = document.querySelector('.switch');
    // if (switchButton) {
    //   switchButton.textContent = state.shortcutOpen ? '关' : '开';
    // }
    render();
    return;
  }

  if (newView) {
    state.currentView = newView;
    render();
    return;
  }
  const validateView = () => {
    const validViews = ['all', 'unfinished', 'finished', 'trash']
      .filter(view => {
        switch (view) {
          case 'unfinished': return state.todos.some(t => !t.completed);
          case 'finished': return state.todos.some(t => t.completed);
          case 'trash': return state.deletedTodos.length > 0;
          default: return true;
        }
      });

    if (!validViews.includes(state.currentView)) {
      state.currentView = 'all';
    }
  };
  // 批量操作
  if (e.target.closest('.all-mark-finished')) {
    state.todos.forEach(t => t.completed = true);
    state.currentView = 'all'; // 强制跳转全部视图
    render(); validateView();
  }

  if (e.target.closest('.cls-finished')) {
    state.deletedTodos.push(...state.todos.filter(t => t.completed));
    state.todos = state.todos.filter(t => !t.completed);
    state.currentView = 'all'; // 新增：强制跳转全部视图
    render(); validateView();
  }

  if (e.target.closest('.cls-all')) {
    state.deletedTodos.push(...state.todos);
    state.todos = [];
    state.currentView = 'all'; // 强制跳转全部视图
    render(); validateView();
  }
  // 主题切换
  if (e.target.closest('.switch')) {
    state.darkMode = !state.darkMode;
    document.querySelector('.switch').textContent = state.shortcutOpen ? '关' : '开';
    render();
  }

  // 数据导出
  if (e.target.closest('.out-data')) {
    const dataStr = JSON.stringify(state.todos);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_${new Date().toISOString()}.json`;
    a.click();
  }

  // 数据导入
  if (e.target.closest('.in-data')) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newTodos = JSON.parse(e.target.result);
          state.todos = [
            ...newTodos.map(t => ({
              ...t,
              id: t.id || Date.now() + Math.random()
            })),
            ...state.todos
          ];
          render();
        } catch (err) {
          alert('文件解析失败，请确保选择正确的数据文件');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
});

// 初始化
render();
document.querySelector('.language-change').addEventListener('click', (e) => {
  if (e.target.closest('.btn-en')) {
    state.lang = 'en';
  } else if (e.target.closest('.btn-zh')) {
    state.lang = 'zh';
  }
  render();
});
const containerTopRight = document.querySelector('.container-top-right');
containerTopRight.textContent = localStorage.getItem('containerTopRight') || '可以添加属于你的专属标语噢';

// 处理输入并更新div和localStorage的函数
function handleInput(input, originalText, divElement) {
  const newValue = input.value.trim()
  // ? input.value : originalText;
  console.log(newValue)
  if (newValue === '') {
    newValue = '可以添加属于你的专属标语噢';
  }
  divElement.textContent = newValue;
  try {
    localStorage.setItem('containerTopRight', newValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// 点击事件监听器
containerTopRight.addEventListener('click', function () {
  const originalText = this.textContent;
  const input = document.createElement('input');
  input.value = originalText;
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  input.style.padding = '5px';
  console.log('Input element:', input);

  // 替换div的内容为输入框
  this.innerHTML = '';
  this.appendChild(input);

  // 聚焦输入框
  input.focus();

  // 监听输入框的失去焦点事件（用户完成输入）
  input.addEventListener('blur', function () {
    handleInput(this, originalText, containerTopRight);
  });

  // 监听输入框的回车事件（用户按下回车键完成输入）
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      handleInput(this, originalText, containerTopRight);
      // 模拟失去焦点
      this.blur();
    }
  });
});

elements.listsUl.addEventListener('dblclick', (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const todoId = Number(li.dataset.id);
  const todo = [...state.todos, ...state.deletedTodos].find(t => t.id === todoId);
  const textElement = li.querySelector('.todo-text');

  // 排除点击按钮的情况
  if (e.target.closest('.todo-btn')) return;

  // 创建输入框
  const input = document.createElement('input');
  input.type = 'text';
  input.value = todo.text;
  input.className = 'edit-input';
  input.style.width = '100%';

  // 替换文本为输入框
  textElement.innerHTML = '';
  textElement.appendChild(input);
  input.focus();

  // 保存修改
  const saveEdit = () => {
    const newText = input.value.trim();
    if (newText && newText !== todo.text) {
      todo.text = newText;
      render();
    } else {
      textElement.textContent = todo.text;
    }
  };


  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') textElement.textContent = todo.text;
  });

  input.addEventListener('blur', saveEdit);
});

const searchInput = document.querySelector('.search-box input');

//扩展状态
let searchKeyword = '';

//独立搜索函数
function filterTasks(tasks) {
  if (!searchKeyword) return tasks;
  const keyword = searchKeyword.toLowerCase();
  return tasks.filter(task =>
    task.text.toLowerCase().includes(keyword)
  );
}

// 渲染
function renderTasks() {
  // 合并所有任务并标记来源
  const allTasks = [
    ...state.todos.map(t => ({ ...t, category: t.completed ? '已完成' : '进行中' })),
    ...state.deletedTodos.map(t => ({ ...t, category: '回收站' }))
  ];

  // 过滤任务
  const filtered = filterTasks(allTasks);


  elements.listsUl.innerHTML = filtered.map(task => `
    <li class="${task.completed ? 'finished-li' : ''}" data-id="${task.id}">
      <div class="todo-btn ${task.completed ? 'btn-finished' : ''}">
        ${task.completed ? '<img src="../img/打勾.svg">' : ''}
      </div>
      <div class="todo-content">
        <div class="todo-text">${task.text}</div>
        <div class="task-meta">
          <span class="time-info">${formatTime(task.createdAt)}</span>
          <span class="task-category">（${task.category}）</span>
        </div>
      </div>
      <div class="todo-btn ${task.category === '回收站' ? 'btn-restore' : 'btn-delete'}">
        <img src="${task.category === '回收站' ? '../img/回退.svg' : '../img/叉.svg'}">
      </div>
    </li>
  `).join('');


  initEventListeners();
}


function initEventListeners() {
  // 双击编辑功能
  elements.listsUl.addEventListener('dblclick', handleDoubleClick);

  // 删除/恢复功能
  elements.listsUl.addEventListener('click', handleActions);
}


function filterTasks(tasks) {
  const keyword = searchKeyword.toLowerCase();
  return tasks.filter(task => {
    // 保持分类信息
    const categoryMatch = task.category.includes(keyword);
    const textMatch = task.text.toLowerCase().includes(keyword);
    return categoryMatch || textMatch;
  });
}

searchInput.addEventListener('input', (e) => {
  searchKeyword = e.target.value.trim();
  renderTasks();
});
