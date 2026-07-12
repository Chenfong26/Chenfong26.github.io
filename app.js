// Web Audio API Synthesizer for Retro Game SFX
const SFX = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  play(type) {
    if (!this.enabled) return;
    this.init();
    
    // Resume context if suspended (browser security autoplay policies)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'check': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(450, now + 0.08);
        osc.frequency.setValueAtTime(600, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'uncheck': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'achievement': {
        // Glorious arpeggio + chord
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          
          // Lowpass filter for warm retro synth tone
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, now);

          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.65);
        });
        break;
      }
      case 'alert': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'complete': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }
};

// Default Panel State Configuration
const DEFAULT_STATE = {
  date: "2026-07-12",
  yesterdayRating: "A",
  greeting: "今天也要做个乖孩子。",
  soundOn: true,
  quests: [
    { id: 1, name: "晨起寸止", desc: "晨起后进行15分钟边缘控射，未经许可不得释放。", reward: "+10 积分", penalty: "惩罚板击打10下", completed: false },
    { id: 2, name: "饮水与排泄管控", desc: "每日饮水需满2000ml，且排泄前必须向Dom报备并获得许可。", reward: "允许自由活动1小时", penalty: "佩戴锁具追加4小时", completed: false },
    { id: 3, name: "姿态规范", desc: "全天保持腰部挺直，坐姿端正，禁止双腿交叠或夹腿。", reward: "获得晚餐甜品许可", penalty: "面壁跪姿反省30分钟", completed: false },
    { id: 4, name: "携带指定道具出门", desc: "外出时需随身佩戴/携带Dom指定的钥匙或束缚道具。", reward: "+15 积分", penalty: "清除昨日所有积分", completed: false },
    { id: 5, name: "定时汇报", desc: "12:00, 18:00, 22:00 准时发送当前状态与定位截图。", reward: "温柔抚摸10分钟", penalty: "今日额外增加1项随机惩罚", completed: false }
  ],
  challenge: {
    name: "边缘控制耐力训练",
    desc: "保持边缘控制状态，直至倒计时结束，未经许可不得释放。",
    duration: 105, // 105 minutes (01:45:00)
    timeLeft: 6300, // seconds
    timerRunning: false,
    maxDuration: 6300 // helper for progress calculation
  },
  penalties: [
    { id: 1, title: "佩戴轻微刺激贴片", sub: "穿戴并开启最低档，直至今日任务完成", status: "active" },
    { id: 2, title: "抄写服从规矩 50 遍", sub: "用手写方式完成并拍照上传", status: "waiting" },
    { id: 3, title: "跪姿反省 15 分钟", sub: "在卧室角落安静完成", status: "settled" }
  ],
  achievements: [
    { id: 1, name: "绝对服从", req: "完成今天所有的必做任务列表", hint: "今日必做全通", type: "服从类", unlocked: false, icon: "🎖️" },
    { id: 2, name: "钢铁耐力", req: "成功度过一次完整的限时耐力挑战", hint: "耐力挑战通关", type: "耐力类", unlocked: false, icon: "⏳" },
    { id: 3, name: "深喉技巧", req: "深喉无呕吐反应累计达30次", hint: "深喉无呕反30次", type: "技巧类", unlocked: false, icon: "👄" },
    { id: 4, name: "户外洗礼", req: "在室外公共场合下顺利执行携带道具任务", hint: "户外执行携带任务", type: "羞耻类", unlocked: false, icon: "🌐" },
    { id: 5, name: "完全降伏", req: "清空并结算所有待执行惩罚队列", hint: "隐藏成就：清空惩罚", type: "隐藏类", unlocked: false, icon: "🔒" }
  ]
};

let state = null;
let timerInterval = null;

// DOM Elements
const currentEl = {
  date: document.getElementById('current-date'),
  yesterdayRating: document.getElementById('yesterday-rating'),
  greeting: document.getElementById('header-greeting'),
  progressText: document.getElementById('progress-text'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressBarGlow: document.getElementById('progress-bar-glow'),
  questsContainer: document.getElementById('quests-container'),
  challengeCard: document.getElementById('challenge-card'),
  challengeName: document.getElementById('challenge-name'),
  challengeDesc: document.getElementById('challenge-desc'),
  timerDisplay: document.getElementById('timer-display'),
  timerProgressFill: document.getElementById('timer-progress-fill'),
  timerStartBtn: document.getElementById('timer-start-btn'),
  timerPauseBtn: document.getElementById('timer-pause-btn'),
  timerResetBtn: document.getElementById('timer-reset-btn'),
  penaltiesContainer: document.getElementById('penalties-container'),
  achievementsContainer: document.getElementById('achievements-container'),
  daddyComment: document.getElementById('daddy-comment'),
  
  // Settings Drawer
  settingsDrawer: document.getElementById('settings-drawer'),
  settingsToggleBtn: document.getElementById('settings-toggle-btn'),
  settingsCloseBtn: document.getElementById('settings-close-btn'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIconPath: document.getElementById('sound-icon-path'),
  
  // Drawer Inputs
  setDate: document.getElementById('set-date'),
  setYesterdayRating: document.getElementById('set-yesterday-rating'),
  setGreeting: document.getElementById('set-greeting'),
  setChallengeName: document.getElementById('set-challenge-name'),
  setChallengeDesc: document.getElementById('set-challenge-desc'),
  setChallengeDuration: document.getElementById('set-challenge-duration'),
  taskManagerList: document.getElementById('task-manager-list'),
  penaltyManagerList: document.getElementById('penalty-manager-list'),
  addCustomTaskBtn: document.getElementById('add-custom-task'),
  addCustomPenaltyBtn: document.getElementById('add-custom-penalty'),
  resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
  clearDataBtn: document.getElementById('clear-data-btn'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  toastContainer: document.getElementById('toast-container')
};

// LocalStorage Handlers
function loadState() {
  const saved = localStorage.getItem('daily_quest_panel_state');
  if (saved) {
    try {
      state = JSON.parse(saved);
      // Compatibility fixes if state format updates
      if (!state.challenge || state.challenge.maxDuration === undefined) {
        state.challenge.maxDuration = state.challenge.duration * 60;
      }
    } catch (e) {
      console.error("Error loading stored state, using defaults", e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    // Fresh launch
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    // Set default date to today's date local
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    state.date = `${yyyy}-${mm}-${dd}`;
  }
  SFX.enabled = state.soundOn;
}

function saveState() {
  state.soundOn = SFX.enabled;
  localStorage.setItem('daily_quest_panel_state', JSON.stringify(state));
}

// Toast Alert System
function showToast(message, type = 'normal') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'achievement' ? '🏆 解锁成就！' : 'ℹ️'} ${message}</span>
  `;
  currentEl.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Sound Button UI Toggle
function updateSoundButton() {
  if (SFX.enabled) {
    currentEl.soundIconPath.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
  } else {
    currentEl.soundIconPath.setAttribute('d', 'M4.27 3L3 4.27 9 10.27v4.73h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z');
  }
}

// Render Panel Views
function renderPanel() {
  // Update Date & Info
  currentEl.date.innerText = state.date;
  currentEl.yesterdayRating.innerText = state.yesterdayRating;
  currentEl.greeting.innerText = `"${state.greeting}"`;
  
  // Render Daily Quests
  renderQuests();

  // Render Challenge Timer
  renderChallenge();

  // Render Penalty Queue
  renderPenalties();

  // Render Achievements
  renderAchievements();

  // Update Dynamic Metrics
  updateMetrics();
}

function renderQuests() {
  currentEl.questsContainer.innerHTML = '';
  if (state.quests.length === 0) {
    currentEl.questsContainer.innerHTML = `<div class="empty-state">当前无必做任务。请点击右上角⚙️图标添加。</div>`;
    return;
  }

  state.quests.forEach(quest => {
    const item = document.createElement('div');
    item.className = `quest-item ${quest.completed ? 'completed' : ''}`;
    item.dataset.id = quest.id;
    
    item.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" ${quest.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <div class="quest-details">
        <h3 class="quest-name">${quest.name}</h3>
        <p class="quest-desc">${quest.desc}</p>
        <div class="quest-rewards">
          <span class="reward-tag">🎁 奖励: ${quest.reward}</span>
          <span class="penalty-tag">⛓️ 惩罚: ${quest.penalty}</span>
        </div>
      </div>
    `;

    // Add checkbox toggle listener
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      quest.completed = e.target.checked;
      item.classList.toggle('completed', quest.completed);
      
      if (quest.completed) {
        SFX.play('check');
      } else {
        SFX.play('uncheck');
      }
      
      saveState();
      updateMetrics();
      checkAchievements();
    });

    currentEl.questsContainer.appendChild(item);
  });
}

function renderChallenge() {
  currentEl.challengeName.innerText = state.challenge.name;
  currentEl.challengeDesc.innerText = state.challenge.desc;
  
  updateTimerDisplay();

  // Button disabled/enabled states
  if (state.challenge.timerRunning) {
    currentEl.timerStartBtn.disabled = true;
    currentEl.timerPauseBtn.disabled = false;
  } else {
    currentEl.timerStartBtn.disabled = false;
    currentEl.timerPauseBtn.disabled = true;
  }
}

function updateTimerDisplay() {
  const t = state.challenge.timeLeft;
  const hrs = String(Math.floor(t / 3600)).padStart(2, '0');
  const mins = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
  const secs = String(t % 60).padStart(2, '0');
  
  currentEl.timerDisplay.innerText = `${hrs}:${mins}:${secs}`;
  
  // Progress fill
  const max = state.challenge.maxDuration || (state.challenge.duration * 60);
  const percent = max > 0 ? (t / max) * 100 : 0;
  currentEl.timerProgressFill.style.width = `${percent}%`;

  // Warning state (less than 10% time left or under 1 minute)
  if (t > 0 && t < 60) {
    currentEl.challengeCard.classList.add('warning');
  } else {
    currentEl.challengeCard.classList.remove('warning');
  }
}

function renderPenalties() {
  currentEl.penaltiesContainer.innerHTML = '';
  const pendingOrActive = state.penalties.filter(p => p.status !== 'settled');
  
  if (state.penalties.length === 0 || pendingOrActive.length === 0) {
    currentEl.penaltiesContainer.innerHTML = `<div class="empty-state">—— 当前无待清算事项 ——</div>`;
    return;
  }

  state.penalties.forEach(penalty => {
    // We display all penalties, but we can visually dim settled ones or hide them.
    // Let's display active and waiting ones prominently. If settled, we show with check badge.
    const item = document.createElement('div');
    item.className = `penalty-item`;
    
    let statusLabel = '';
    let statusClass = '';
    
    if (penalty.status === 'active') {
      statusLabel = '🔴 执行中';
      statusClass = 'active';
    } else if (penalty.status === 'waiting') {
      statusLabel = '⏳ 等待执行';
      statusClass = 'waiting';
    } else {
      statusLabel = '✅ 已结算';
      statusClass = 'settled';
    }

    item.innerHTML = `
      <div class="penalty-content">
        <span class="penalty-title">${penalty.title}</span>
        <span class="penalty-sub">${penalty.sub}</span>
      </div>
      <span class="penalty-status-badge ${statusClass}">${statusLabel}</span>
    `;

    // Click to cycle status
    const badge = item.querySelector('.penalty-status-badge');
    badge.addEventListener('click', () => {
      SFX.play('click');
      if (penalty.status === 'waiting') {
        penalty.status = 'active';
      } else if (penalty.status === 'active') {
        penalty.status = 'settled';
        showToast(`惩罚 [${penalty.title}] 已结算`, 'normal');
      } else {
        penalty.status = 'waiting';
      }
      saveState();
      renderPenalties();
      checkAchievements();
    });

    currentEl.penaltiesContainer.appendChild(item);
  });
}

function renderAchievements() {
  currentEl.achievementsContainer.innerHTML = '';
  
  state.achievements.forEach(ach => {
    const item = document.createElement('div');
    item.className = `badge-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
    
    // Obfuscate text for locked achievements
    const nameText = ach.unlocked ? ach.name : obfuscateString(ach.name);
    const tooltipText = ach.unlocked ? `解锁条件: ${ach.req}` : `解锁线索: ${ach.hint}`;
    
    item.dataset.tooltip = tooltipText;
    item.innerHTML = `
      <div class="badge-icon-container">
        ${ach.unlocked ? ach.icon : '🔒'}
      </div>
      <span class="badge-name">${nameText}</span>
      <span class="badge-type">${ach.type}</span>
    `;

    currentEl.achievementsContainer.appendChild(item);
  });
}

function obfuscateString(str) {
  if (str.length <= 1) return "?";
  // Reveal only the first character, rest are stars or sub hint
  return str.substring(0, 1) + "🗏".repeat(str.length - 1);
}

// Calculate Progress and update footer/header evaluation dynamically
function updateMetrics() {
  const total = state.quests.length;
  if (total === 0) {
    currentEl.progressText.innerText = '0%';
    currentEl.progressBarFill.style.width = '0%';
    currentEl.progressBarGlow.style.width = '0%';
    updateDaddyComment(0);
    return;
  }

  const completed = state.quests.filter(q => q.completed).length;
  const percent = Math.round((completed / total) * 100);

  currentEl.progressText.innerText = `${percent}%`;
  currentEl.progressBarFill.style.width = `${percent}%`;
  currentEl.progressBarGlow.style.width = `${percent}%`;

  updateDaddyComment(percent);
}

function updateDaddyComment(percent) {
  let comment = '';
  
  if (percent === 100) {
    comment = '“完美服从！真是Daddy最引以为傲的乖宝贝，晚上来领取你的专属奖励吧~”';
    currentEl.daddyComment.style.color = 'var(--neon-green)';
  } else if (percent >= 80) {
    comment = '“做得很好，今天表现很听话。继续保持，不要让任何错误毁了今晚的拥抱。”';
    currentEl.daddyComment.style.color = 'var(--neon-cyan)';
  } else if (percent >= 40) {
    comment = '“进度过半了，但还远远不够。不要松懈，我正在看着你，乖孩子。”';
    currentEl.daddyComment.style.color = 'var(--neon-orange)';
  } else {
    comment = '“今天效率这么慢，是皮痒了想挨罚，还是想在惩罚室里过夜？”';
    currentEl.daddyComment.style.color = 'var(--neon-pink)';
  }

  currentEl.daddyComment.innerText = comment;
}

// Timer Controls
function startTimer() {
  SFX.play('click');
  if (state.challenge.timerRunning) return;

  state.challenge.timerRunning = true;
  saveState();
  renderChallenge();

  timerInterval = setInterval(() => {
    if (state.challenge.timeLeft > 0) {
      state.challenge.timeLeft--;
      updateTimerDisplay();
      // Auto-save every 10 seconds to avoid major progress loss
      if (state.challenge.timeLeft % 10 === 0) {
        saveState();
      }
    } else {
      // Timer finished!
      clearInterval(timerInterval);
      state.challenge.timerRunning = false;
      SFX.play('complete');
      showToast(`限时挑战: [${state.challenge.name}] 已成功通关！`, 'normal');
      
      saveState();
      renderChallenge();
      checkAchievements();
    }
  }, 1000);
}

function pauseTimer() {
  SFX.play('click');
  if (!state.challenge.timerRunning) return;

  clearInterval(timerInterval);
  state.challenge.timerRunning = false;
  saveState();
  renderChallenge();
}

function resetTimer() {
  SFX.play('click');
  clearInterval(timerInterval);
  state.challenge.timerRunning = false;
  state.challenge.timeLeft = state.challenge.duration * 60;
  state.challenge.maxDuration = state.challenge.duration * 60;
  
  saveState();
  renderChallenge();
}

// Achievements Logic Checkers
function checkAchievements() {
  let stateChanged = false;

  // Achievement 1: 绝对服从 (All quests completed)
  const ach1 = state.achievements.find(a => a.id === 1);
  if (ach1 && !ach1.unlocked) {
    const allDone = state.quests.length > 0 && state.quests.every(q => q.completed);
    if (allDone) {
      ach1.unlocked = true;
      stateChanged = true;
      triggerAchievementUnlock(ach1);
    }
  }

  // Achievement 2: 钢铁耐力 (Challenge timer hit 0)
  const ach2 = state.achievements.find(a => a.id === 2);
  if (ach2 && !ach2.unlocked) {
    if (state.challenge.timeLeft === 0 && state.challenge.duration > 0) {
      ach2.unlocked = true;
      stateChanged = true;
      triggerAchievementUnlock(ach2);
    }
  }

  // Achievement 5: 完全降伏 (All penalty queue is cleared/settled)
  const ach5 = state.achievements.find(a => a.id === 5);
  if (ach5 && !ach5.unlocked) {
    const allSettled = state.penalties.length > 0 && state.penalties.every(p => p.status === 'settled');
    if (allSettled) {
      ach5.unlocked = true;
      stateChanged = true;
      triggerAchievementUnlock(ach5);
    }
  }

  if (stateChanged) {
    saveState();
    renderAchievements();
  }
}

function triggerAchievementUnlock(ach) {
  SFX.play('achievement');
  showToast(`成就解锁：[${ach.name}]！`, 'achievement');
}

// Settings Drawer Interface
function initDrawer() {
  currentEl.settingsToggleBtn.addEventListener('click', () => {
    SFX.play('click');
    openDrawer();
  });
  
  currentEl.settingsCloseBtn.addEventListener('click', () => {
    SFX.play('click');
    closeDrawer();
  });

  currentEl.soundToggleBtn.addEventListener('click', () => {
    SFX.enabled = !SFX.enabled;
    SFX.play('click');
    updateSoundButton();
    saveState();
  });

  currentEl.addCustomTaskBtn.addEventListener('click', () => {
    SFX.play('click');
    addCustomTaskField();
  });

  currentEl.addCustomPenaltyBtn.addEventListener('click', () => {
    SFX.play('click');
    addCustomPenaltyField();
  });

  currentEl.resetDefaultsBtn.addEventListener('click', () => {
    if (confirm("确定要恢复默认设置吗？这会清空你现有的自定义内容。")) {
      SFX.play('alert');
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      renderPanel();
      closeDrawer();
      showToast("已恢复默认出厂设置");
    }
  });

  currentEl.clearDataBtn.addEventListener('click', () => {
    if (confirm("确定要清空今日进度吗？这会重置所有任务勾选，重置挑战倒计时。")) {
      SFX.play('alert');
      state.quests.forEach(q => q.completed = false);
      state.challenge.timeLeft = state.challenge.duration * 60;
      state.challenge.timerRunning = false;
      clearInterval(timerInterval);
      saveState();
      renderPanel();
      closeDrawer();
      showToast("已清空今日任务进度");
    }
  });

  currentEl.saveSettingsBtn.addEventListener('click', () => {
    SFX.play('click');
    saveDrawerSettings();
    closeDrawer();
    showToast("设置已应用并保存");
  });
}

function openDrawer() {
  // Populate Fields
  currentEl.setDate.value = state.date;
  currentEl.setYesterdayRating.value = state.yesterdayRating;
  currentEl.setGreeting.value = state.greeting;
  currentEl.setChallengeName.value = state.challenge.name;
  currentEl.setChallengeDesc.value = state.challenge.desc;
  currentEl.setChallengeDuration.value = state.challenge.duration;

  // Populate Tasks Config List
  currentEl.taskManagerList.innerHTML = '';
  state.quests.forEach((q, index) => {
    addTaskConfigItem(q, index);
  });

  // Populate Penalties Config List
  currentEl.penaltyManagerList.innerHTML = '';
  state.penalties.forEach((p, index) => {
    addPenaltyConfigItem(p, index);
  });

  currentEl.settingsDrawer.classList.add('open');
}

function closeDrawer() {
  currentEl.settingsDrawer.classList.remove('open');
}

// Tasks Config Items
function addTaskConfigItem(q = null) {
  const item = document.createElement('div');
  item.className = 'task-manager-item';
  
  const id = q ? q.id : Date.now();
  const name = q ? q.name : '';
  const desc = q ? q.desc : '';
  const reward = q ? q.reward : '';
  const penalty = q ? q.penalty : '';

  item.innerHTML = `
    <button class="delete-manager-btn" onclick="this.parentElement.remove(); SFX.play('uncheck');">&times;</button>
    <div class="form-field">
      <input type="text" class="cfg-task-name" placeholder="任务简称" value="${name}" required>
    </div>
    <div class="form-field">
      <input type="text" class="cfg-task-desc" placeholder="一句话描述" value="${desc}">
    </div>
    <div style="display:flex; gap: 4px;">
      <input type="text" class="cfg-task-reward" placeholder="奖励" value="${reward}" style="flex:1; font-size:0.75rem;">
      <input type="text" class="cfg-task-penalty" placeholder="惩罚" value="${penalty}" style="flex:1; font-size:0.75rem;">
    </div>
    <input type="hidden" class="cfg-task-id" value="${id}">
    <input type="hidden" class="cfg-task-completed" value="${q ? q.completed : false}">
  `;

  currentEl.taskManagerList.appendChild(item);
}

function addCustomTaskField() {
  addTaskConfigItem();
}

// Penalties Config Items
function addPenaltyConfigItem(p = null) {
  const item = document.createElement('div');
  item.className = 'penalty-manager-item';

  const id = p ? p.id : Date.now();
  const title = p ? p.title : '';
  const sub = p ? p.sub : '';
  const status = p ? p.status : 'waiting';

  item.innerHTML = `
    <button class="delete-manager-btn" onclick="this.parentElement.remove(); SFX.play('uncheck');">&times;</button>
    <div class="form-field">
      <input type="text" class="cfg-penalty-title" placeholder="惩罚项目" value="${title}" required>
    </div>
    <div class="form-field">
      <input type="text" class="cfg-penalty-sub" placeholder="执行细则" value="${sub}">
    </div>
    <div class="form-field">
      <select class="cfg-penalty-status">
        <option value="waiting" ${status === 'waiting' ? 'selected' : ''}>⏳等待执行</option>
        <option value="active" ${status === 'active' ? 'selected' : ''}>🔴执行中</option>
        <option value="settled" ${status === 'settled' ? 'selected' : ''}>✅已结算</option>
      </select>
    </div>
    <input type="hidden" class="cfg-penalty-id" value="${id}">
  `;

  currentEl.penaltyManagerList.appendChild(item);
}

function addCustomPenaltyField() {
  addPenaltyConfigItem();
}

// Save all Settings from Drawer
function saveDrawerSettings() {
  // Basic Settings
  state.date = currentEl.setDate.value || state.date;
  state.yesterdayRating = currentEl.setYesterdayRating.value;
  state.greeting = currentEl.setGreeting.value || state.greeting;

  // Challenge Settings
  state.challenge.name = currentEl.setChallengeName.value || state.challenge.name;
  state.challenge.desc = currentEl.setChallengeDesc.value || state.challenge.desc;
  
  const oldDuration = state.challenge.duration;
  const newDuration = parseInt(currentEl.setChallengeDuration.value) || oldDuration;
  state.challenge.duration = newDuration;

  // If duration changed, reset challenge timer
  if (oldDuration !== newDuration) {
    state.challenge.timeLeft = newDuration * 60;
    state.challenge.maxDuration = newDuration * 60;
    state.challenge.timerRunning = false;
    clearInterval(timerInterval);
  }

  // Parse Tasks Config List
  const newQuests = [];
  const taskItems = currentEl.taskManagerList.querySelectorAll('.task-manager-item');
  taskItems.forEach(item => {
    const id = parseInt(item.querySelector('.cfg-task-id').value);
    const name = item.querySelector('.cfg-task-name').value.trim();
    const desc = item.querySelector('.cfg-task-desc').value.trim();
    const reward = item.querySelector('.cfg-task-reward').value.trim();
    const penalty = item.querySelector('.cfg-task-penalty').value.trim();
    const completed = item.querySelector('.cfg-task-completed').value === 'true';

    if (name) {
      newQuests.push({ id, name, desc, reward, penalty, completed });
    }
  });
  state.quests = newQuests;

  // Parse Penalties Config List
  const newPenalties = [];
  const penaltyItems = currentEl.penaltyManagerList.querySelectorAll('.penalty-manager-item');
  penaltyItems.forEach(item => {
    const id = parseInt(item.querySelector('.cfg-penalty-id').value);
    const title = item.querySelector('.cfg-penalty-title').value.trim();
    const sub = item.querySelector('.cfg-penalty-sub').value.trim();
    const status = item.querySelector('.cfg-penalty-status').value;

    if (title) {
      newPenalties.push({ id, title, sub, status });
    }
  });
  state.penalties = newPenalties;

  saveState();
  renderPanel();
}

// Initializer
function init() {
  loadState();
  updateSoundButton();
  renderPanel();
  initDrawer();

  // Re-establish timer if it was running on previous save
  if (state.challenge.timerRunning) {
    state.challenge.timerRunning = false; // reset to let startTimer trigger
    startTimer();
  }

  // Listeners for Timer Actions
  currentEl.timerStartBtn.addEventListener('click', startTimer);
  currentEl.timerPauseBtn.addEventListener('click', pauseTimer);
  currentEl.timerResetBtn.addEventListener('click', resetTimer);
}

// Run Initializer
document.addEventListener('DOMContentLoaded', init);
window.SFX = SFX; // Expose SFX object globally for delete button onClick handler in HTML strings
