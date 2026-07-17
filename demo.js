(() => {
  const stage = Number(new URLSearchParams(location.search).get('demo'));
  if (!stage) return;
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const addTask = text => {
    taskInput.value = text;
    taskForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };
  const caption = text => {
    const el = document.getElementById('toast');
    el.textContent = text;
    el.classList.add('show');
  };
  if (stage >= 2) {
    addTask('Preparar mi entrega para Platzi');
    addTask('Revisar el video demo');
  }
  if (stage === 1) caption('Foco Â· Pomodoro adaptable');
  if (stage === 2) caption('1 Â· Organiza tus pequeÃ±as victorias');
  if (stage === 3) {
    document.getElementById('playButton').click();
    document.getElementById('time').textContent = '24:42';
    document.getElementById('playText').textContent = 'pausar';
    caption('2 Â· EnfÃ³cate sin distracciones');
  }
  if (stage >= 4) {
    document.querySelector('.task-item .check')?.click();
    document.getElementById('focusMinutes').textContent = '25';
    document.getElementById('completedSessions').textContent = '1';
    document.querySelector('.day.today .bar')?.setAttribute('style', 'height:38px');
  }
  if (stage === 4) caption('3 Â· Mira tu progreso crecer');
  if (stage === 5) {
    document.getElementById('settingsButton').click();
    caption('4 Â· Encuentra tu propio ritmo');
  }
})();

