(() => {
  const state = {
    supabase: null,
    isAuthorized: false,
    questions: [],
    // ... 其他状态保持不变

    selectedId: null,
    selectedIds: new Set(),
    settings: { daily_mode_enabled: false },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    },
    filters: {
      search: '',
      status: 'all'
    },
    calYear: null,
    calMonth: null,
    calendarData: {},
    chart: null // 保存 Chart 实例
  };

  // --- 初始化 ---
  async function init() {
    state.supabase = createClient();
    if (!state.supabase) return;

    // 暴露给全局，方便控制台调试获取 ID
    window.supabaseClient = state.supabase;

    bindPassphraseAuth(); // 使用新的口令校验逻辑
    bindTabs();
    bindUI();
    
    // 初始化日历年月
    const now = new Date();
    state.calYear = now.getFullYear();
    state.calMonth = now.getMonth();

    // 更新时间显示
    updateLastUpdated();
  }

  function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) {
      const now = new Date();
      el.textContent = `最后更新: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
  }

  function createClient() {
    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      showToast('缺少 Supabase 配置', 'error');
      return null;
    }
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  // --- 权限与认证 (口令流) ---
  function bindPassphraseAuth() {
    const PASSPHRASE_KEY = 'admin_passphrase_authorized';
    const DEFAULT_PASSPHRASE = 'blackout888'; // 默认口令

    const gate = document.getElementById('adminGate');
    const content = document.getElementById('adminContent');
    const input = document.getElementById('adminPassphrase');
    const btnSubmit = document.getElementById('btnSubmitPassphrase');
    const btnLogout = document.getElementById('adminBtnLogout');
    const errorMsg = document.getElementById('passphraseError');
    const badge = document.getElementById('adminUserBadge');

    const showAdminContent = () => {
        state.isAuthorized = true;
        if (gate) gate.style.display = 'none';
        if (content) content.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'block';
        if (badge) badge.textContent = '管理员模式';
        
        // 加载数据
        loadAppSettings();
        loadDashboardData(); 
        loadQuestions();
        loadCalendarData();
    };

    const verifyPassphrase = () => {
        const val = input.value.trim();
        if (val === DEFAULT_PASSPHRASE) {
            sessionStorage.setItem(PASSPHRASE_KEY, 'true');
            showAdminContent();
        } else {
            if (errorMsg) errorMsg.style.display = 'block';
            input.value = '';
            input.focus();
        }
    };

    // 检查 SessionStorage 是否已授权
    if (sessionStorage.getItem(PASSPHRASE_KEY) === 'true') {
        showAdminContent();
    }

    // 绑定事件
    btnSubmit?.addEventListener('click', verifyPassphrase);
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyPassphrase();
    });

    btnLogout?.addEventListener('click', () => {
        sessionStorage.removeItem(PASSPHRASE_KEY);
        window.location.reload();
    });
  }

  // 移除旧的 checkAdmin 和 updateAuthUI


  // --- 仪表盘数据加载 ---
  async function loadDashboardData() {
    await loadDashboardStats();
    await loadTodayPoem();
    renderParticipationChart();
  }

  async function loadDashboardStats() {
    if (!state.supabase || !state.isAuthorized) return;
    try {

      // 诗词总数
      const { count: total } = await state.supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true });
      
      // 已发布诗词数
      const { count: published } = await state.supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      // 已排期诗词数
      const { count: scheduled } = await state.supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');
      
      // 今日参与度（模拟数据，后续可从 stats 表获取）
      const todayParticipation = Math.floor(Math.random() * 500) + 800;

      document.getElementById('statTotalPoems').textContent = total || 0;
      document.getElementById('statPublishedPoems').textContent = published || 0;
      document.getElementById('statScheduledPoems').textContent = scheduled || 0;
      document.getElementById('statTodayParticipation').textContent = todayParticipation.toLocaleString();
      
      updateLastUpdated();
    } catch (error) {
      console.error('加载仪表盘统计失败:', error);
      showToast('加载统计信息失败', 'error');
    }
  }

  async function loadTodayPoem() {
    try {
      const todayStr = window.DateUtils ? window.DateUtils.getTodayString() : new Date().toISOString().split('T')[0];
      const { data, error } = await state.supabase
        .from('question_bank')
        .select('*')
        .eq('publish_date', todayStr)
        .limit(1)
        .maybeSingle();
      
      const container = document.getElementById('todayPoemDisplay');
      const statusBadge = document.getElementById('todayPoemStatus');

      if (error || !data) {
        container.innerHTML = '<div class="placeholder">今日尚未安排题目</div>';
        statusBadge.textContent = '未安排';
        statusBadge.className = 'status-badge status-draft';
        return;
      }

      statusBadge.textContent = getStatusLabel(data.status);
      statusBadge.className = `status-badge status-${data.status}`;
      
      // 截取内容预览（最多200字符）
      const previewContent = data.content.length > 200 
        ? data.content.substring(0, 200) + '...' 
        : data.content;
      
      container.innerHTML = `
        <div class="today-poem-preview">
          <h4 style="margin:0 0 10px 0; font-size:16px; font-weight:600">${data.title}</h4>
          <div style="font-size:13px; color:#666; margin-bottom:15px; display:flex; gap:12px">
            <span>[${data.dynasty}]</span>
            <span>${data.author}</span>
            <span style="color:#999">${data.publish_date}</span>
          </div>
          <div style="font-family:var(--font-serif); white-space:pre-line; line-height:1.6; max-height:150px; overflow-y:auto; font-size:14px">
            ${previewContent}
          </div>
        </div>
      `;

      document.getElementById('btnViewTodayDetail').onclick = () => editQuestion(data.id);
      
      // 更换按钮跳转到日历
      document.getElementById('btnChangeTodayPoem').onclick = () => {
        document.querySelector('.menu-item[data-tab="tab-calendar"]').click();
      };
    } catch (error) {
      console.error('加载今日诗词失败:', error);
      showToast('加载今日诗词失败', 'error');
    }
  }

  function renderParticipationChart() {
    try {
      const ctx = document.getElementById('participationChart').getContext('2d');
      if (state.chart) state.chart.destroy();

      // 生成最近7天的数据（模拟）
      const labels = [];
      const data = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        data.push(Math.floor(Math.random() * 2000) + 1000); // 模拟数据
      }

      state.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '参与人次',
            data: data,
            borderColor: '#40739e',
            backgroundColor: 'rgba(64, 115, 158, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#40739e',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#40739e',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `参与人次: ${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { 
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                callback: function(value) {
                  return value.toLocaleString();
                }
              }
            },
            x: { 
              grid: { 
                display: false 
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear'
            }
          }
        }
      });
    } catch (error) {
      console.error('渲染图表失败:', error);
      document.getElementById('participationChart').innerHTML = '<div style="color:#999; text-align:center; padding:40px">图表加载失败</div>';
    }
  }

  // --- 选项卡切换 (侧边栏) ---
  function bindTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    const titleEl = document.getElementById('currentTabTitle');

    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.dataset.tab;
        
        // 切换菜单状态
        menuItems.forEach(m => m.classList.remove('active'));
        item.classList.add('active');
        
        // 切换标题
        titleEl.textContent = item.textContent.trim().replace(/[^\u4e00-\u9fa5]/g, '');
        
        // 切换内容
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        // 特定页面的加载逻辑
        if (tabId === 'tab-dashboard') loadDashboardData();
        if (tabId === 'tab-list') loadQuestions();
        if (tabId === 'tab-calendar') loadCalendarData();
      });
    });
  }

  // --- 题目管理逻辑 ---
  async function loadQuestions() {
    if (!state.supabase || !state.isAuthorized) return;

    const tbody = document.querySelector('#questionTable tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
          <div style="color: var(--text-light); font-size: 14px;">正在加载诗词库...</div>
        </td>
      </tr>
    `;

    try {
      let query = state.supabase
        .from('question_bank')
        .select('*', { count: 'exact' });

      // 搜索过滤
      if (state.filters.search) {
        query = query.or(`title.ilike.%${state.filters.search}%,content.ilike.%${state.filters.search}%,author.ilike.%${state.filters.search}%`);
      }

      // 状态过滤
      if (state.filters.status !== 'all') {
        query = query.eq('status', state.filters.status);
      }

      // 分页与排序
      const from = (state.pagination.page - 1) * state.pagination.pageSize;
      const to = from + state.pagination.pageSize - 1;
      
      query = query
        .order('publish_date', { ascending: false, nullsFirst: true })
        .order('id', { ascending: false })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      state.questions = data || [];
      state.pagination.total = count || 0;
      
      renderQuestionTable();
      renderPagination();
      updateTotalCount();
    } catch (error) {
      console.error('加载诗词库失败:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px;">
            <div style="color: var(--accent-color); margin-bottom: 12px;">❌ 加载失败</div>
            <div style="color: var(--text-light); font-size: 13px; margin-bottom: 16px;">${error.message}</div>
            <button class="btn btn-sm btn-primary" onclick="loadQuestions()">重试</button>
          </td>
        </tr>
      `;
      showToast('加载诗词库失败: ' + error.message, 'error');
    }
  }

  function renderQuestionTable() {
    const tbody = document.querySelector('#questionTable tbody');
    if (state.questions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px;">
            <div style="color: var(--text-light); margin-bottom: 12px;">📝 暂无匹配题目</div>
            <div style="color: var(--text-light); font-size: 13px;">尝试调整搜索条件或创建新题目</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = state.questions.map(q => {
      // 生成内容预览（最多80字符）
      const previewContent = q.content 
        ? (q.content.replace(/\n/g, ' ').substring(0, 80) + (q.content.length > 80 ? '...' : ''))
        : '';
      
      // 格式化发布日期
      const publishDate = q.publish_date 
        ? new Date(q.publish_date).toLocaleDateString('zh-CN')
        : '-';
      
      return `
        <tr data-id="${q.id}" class="question-row">
          <td data-label="选择"><input type="checkbox" class="row-select" data-id="${q.id}" ${state.selectedIds.has(String(q.id)) ? 'checked' : ''}></td>
          <td data-label="ID" class="mono" style="font-size: 12px; color: #666;">${q.id}</td>
          <td data-label="标题" class="title-cell" style="font-weight: 600; color: var(--secondary-color);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${q.title}</span>
              ${q.language === 'zh-TW' ? '<span style="font-size: 10px; background: #e6f7ff; color: #1890ff; padding: 2px 6px; border-radius: 4px;">繁</span>' : ''}
              ${q.language === 'en' ? '<span style="font-size: 10px; background: #f6ffed; color: #52c41a; padding: 2px 6px; border-radius: 4px;">EN</span>' : ''}
            </div>
          </td>
          <td data-label="内容预览" class="content-preview" style="font-size: 13px; color: #666; line-height: 1.4;">
            ${previewContent}
          </td>
          <td data-label="作者" style="font-weight: 500;">${q.author}</td>
          <td data-label="状态"><span class="status-badge status-${q.status}">${getStatusLabel(q.status)}</span></td>
          <td data-label="发布日期" class="mono" style="font-size: 12px; color: #666;">${publishDate}</td>
          <td class="actions" data-label="操作" style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" onclick="editQuestion(${q.id})" title="编辑">
              <span style="font-size: 12px;">✏️</span>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="previewQuestion(${q.id})" title="预览">
              <span style="font-size: 12px;">👁️</span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})" title="删除">
              <span style="font-size: 12px;">🗑️</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // 绑定复选框事件
    tbody.querySelectorAll('.row-select').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
        updateBulkActions();
      });
    });

    // 添加行悬停效果
    tbody.querySelectorAll('.question-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = 'rgba(64, 115, 158, 0.03)';
      });
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
    });
  }

  function getStatusLabel(status) {
    const labels = { draft: '草稿', scheduled: '已排期', published: '已发布' };
    return labels[status] || status;
  }

  function renderPagination() {
    const container = document.getElementById('pagination');
    const totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
    
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    
    // 上一页按钮
    if (state.pagination.page > 1) {
      html += `<button class="page-btn" onclick="goToPage(${state.pagination.page - 1})" title="上一页">‹</button>`;
    }

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= state.pagination.page - 2 && i <= state.pagination.page + 2)) {
        html += `<button class="page-btn ${i === state.pagination.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
      } else if (i === state.pagination.page - 3 || i === state.pagination.page + 3) {
        html += `<span class="page-dots">...</span>`;
      }
    }

    // 下一页按钮
    if (state.pagination.page < totalPages) {
      html += `<button class="page-btn" onclick="goToPage(${state.pagination.page + 1})" title="下一页">›</button>`;
    }

    container.innerHTML = html;
  }

  function updateTotalCount() {
    const countElement = document.getElementById('totalCount');
    const total = state.pagination.total;
    
    if (total === 0) {
      countElement.textContent = '暂无数据';
    } else {
      const start = (state.pagination.page - 1) * state.pagination.pageSize + 1;
      const end = Math.min(state.pagination.page * state.pagination.pageSize, total);
      countElement.textContent = `显示 ${start}-${end} 条，共 ${total} 条`;
    }
  }

  // --- 操作函数 ---
  window.goToPage = (page) => {
    state.pagination.page = page;
    loadQuestions();
  };

  window.editQuestion = async (id) => {
    let q = state.questions.find(item => item.id === id);
    
    // 如果列表里没找到（比如从日历点过来的），去数据库查最新的
    if (!q) {
      showToast('正在加载题目详情...', 'info');
      const { data, error } = await state.supabase
        .from('question_bank')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        showToast('无法获取题目详情', 'error');
        return;
      }
      q = data;
    }
    
    state.selectedId = id;
    document.getElementById('modalTitle').textContent = `编辑题目`;
    
    const form = document.getElementById('questionForm');
    form.qTitle.value = q.title || '';
    form.qAuthor.value = q.author || '';
    form.qDynasty.value = q.dynasty || '';
    form.qType.value = q.type || 'poem';
    form.qContent.value = q.content || '';
    form.qStatus.value = q.status || 'draft';
    form.qPublishDate.value = q.publish_date || '';
    form.qLang.value = q.language || 'zh-CN';
    form.qEnabled.checked = q.enabled !== false;
    
    document.getElementById('editModal').style.display = 'block';
  };

  window.previewQuestion = (id) => {
    const q = state.questions.find(item => item.id === id);
    if (!q) return;
    
    const previewArea = document.getElementById('previewGameArea');
    const contentLines = q.content ? q.content.split('\n') : [];
    
    previewArea.innerHTML = `
      <div class="game-preview-container" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%;">
        <h2 style="text-align: center; margin-bottom: 10px;">${q.title}</h2>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">[${q.dynasty}] ${q.author}</p>
        <div class="poem-content" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          ${contentLines.map(line => `<div style="font-size: 1.2rem; letter-spacing: 2px;">${line}</div>`).join('')}
        </div>
      </div>
      <div style="margin-top: 20px; font-size: 14px; color: #888;">* 此为样式预览，不代表最终游戏逻辑</div>
    `;
    
    document.getElementById('previewModal').style.display = 'block';
  };

  window.deleteQuestion = async (id) => {
    if (!confirm('确定要删除这道题目吗？此操作不可撤销。')) return;
    
    const { error } = await state.supabase
      .from('question_bank')
      .delete()
      .eq('id', id);
      
    if (error) {
      showToast('删除失败: ' + error.message, 'error');
    } else {
      showToast('删除成功', 'success');
      loadQuestions();
      loadCalendarData();
    }
  };

  // --- UI 事件绑定 ---
  function bindUI() {
    // 搜索
    let searchTimeout;
    document.getElementById('searchQuestions')?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.filters.search = e.target.value;
        state.pagination.page = 1;
        loadQuestions();
      }, 500);
    });

    // 过滤器
    document.getElementById('filterStatus')?.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      state.pagination.page = 1;
      loadQuestions();
    });

    document.getElementById('pageSize')?.addEventListener('change', (e) => {
      state.pagination.pageSize = parseInt(e.target.value);
      state.pagination.page = 1;
      loadQuestions();
    });

    // 新增按钮
    document.getElementById('btnCreateNew')?.addEventListener('click', () => {
      state.selectedId = null;
      document.getElementById('modalTitle').textContent = '新增题目';
      document.getElementById('questionForm').reset();
      document.getElementById('editModal').style.display = 'block';
    });

    // 表单提交
    document.getElementById('questionForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const payload = {
        title: form.qTitle.value,
        author: form.qAuthor.value,
        dynasty: form.qDynasty.value,
        type: form.qType.value,
        content: form.qContent.value,
        status: form.qStatus.value,
        publish_date: form.qPublishDate.value || null,
        language: form.qLang.value,
        enabled: form.qEnabled.checked
      };

      let error;
      if (state.selectedId) {
        // 更新
        const { error: err } = await state.supabase
          .from('question_bank')
          .update(payload)
          .eq('id', state.selectedId);
        error = err;
      } else {
        // 新增
        const { error: err } = await state.supabase
          .from('question_bank')
          .insert(payload);
        error = err;
      }

      if (error) {
        showToast('保存失败: ' + error.message, 'error');
      } else {
        showToast('保存成功', 'success');
        document.getElementById('editModal').style.display = 'none';
        loadQuestions();
        loadCalendarData();
      }
    });

    // 全选
    document.getElementById('selectAllHeader')?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('.row-select').forEach(cb => {
        cb.checked = checked;
        const id = cb.dataset.id;
        if (checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
      });
      updateBulkActions();
    });

    // 批量操作
    document.getElementById('btnBulkSchedule')?.addEventListener('click', async () => {
      const date = document.getElementById('bulkPublishDate').value;
      if (!date) return showToast('请选择排期日期', 'info');
      
      const ids = Array.from(state.selectedIds);
      const { error } = await state.supabase
        .from('question_bank')
        .update({ status: 'scheduled', publish_date: date })
        .in('id', ids);
        
      if (error) showToast('操作失败: ' + error.message, 'error');
      else {
        showToast(`已排期 ${ids.length} 项`, 'success');
        state.selectedIds.clear();
        loadQuestions();
        loadCalendarData();
      }
    });

    document.getElementById('btnBulkPublish')?.addEventListener('click', async () => {
      const ids = Array.from(state.selectedIds);
      const { error } = await state.supabase
        .from('question_bank')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .in('id', ids);
        
      if (error) showToast('操作失败: ' + error.message, 'error');
      else {
        showToast(`已发布 ${ids.length} 项`, 'success');
        state.selectedIds.clear();
        loadQuestions();
        loadCalendarData();
      }
    });

    // 模态窗关闭
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('previewModal').style.display = 'none';
      });
    });

    // 点击外部关闭模态窗
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // 系统设置工具
    document.getElementById('btnCleanDuplicates')?.addEventListener('click', async () => {
      if (!confirm('清理重复题目将保留相同标题中内容最长的一条，并删除其余重复项。确定执行吗？')) return;
      
      try {
        showToast('正在分析重复数据...', 'info');
        
        // 1. 获取所有题目进行本地分析（如果题目非常多，建议用 RPC）
        const { data: allPoems, error: fetchErr } = await state.supabase
          .from('question_bank')
          .select('id, title, content')
          .order('title', { ascending: true });

        if (fetchErr) throw fetchErr;

        const toDelete = [];
        const titleMap = new Map();

        allPoems.forEach(p => {
          if (titleMap.has(p.title)) {
            const existing = titleMap.get(p.title);
            // 比较内容长度，保留长的
            if ((p.content?.length || 0) > (existing.content?.length || 0)) {
              toDelete.push(existing.id);
              titleMap.set(p.title, p);
            } else {
              toDelete.push(p.id);
            }
          } else {
            titleMap.set(p.title, p);
          }
        });

        if (toDelete.length === 0) {
          return showToast('未发现重复题目', 'success');
        }

        if (!confirm(`发现 ${toDelete.length} 条重复项，确定删除吗？`)) return;

        // 2. 批量删除
        const { error: delErr } = await state.supabase
          .from('question_bank')
          .delete()
          .in('id', toDelete);

        if (delErr) throw delErr;

        showToast(`成功清理 ${toDelete.length} 条重复项`, 'success');
        loadQuestions();
        loadCalendarData();
      } catch (err) {
        showToast('清理失败: ' + err.message, 'error');
      }
    });

    document.getElementById('btnAutoScheduleAll')?.addEventListener('click', async () => {
      if (!confirm('全自动排期将为所有启用但未排期的题目按顺序分配日期。确定执行吗？')) return;
      
      try {
        // 逻辑：获取所有未排期的题目
        const { data: poems, error: fetchErr } = await state.supabase
          .from('question_bank')
          .select('id')
          .is('publish_date', null)
          .eq('enabled', true)
          .order('id', { ascending: true });

        if (fetchErr) throw fetchErr;
        if (!poems.length) return showToast('没有需要排期的题目', 'info');

        // 找到当前最后一天
        const { data: lastOne } = await state.supabase
          .from('question_bank')
          .select('publish_date')
          .not('publish_date', 'is', null)
          .order('publish_date', { ascending: false })
          .limit(1);
        
        let startDate = new Date();
        if (lastOne?.[0]?.publish_date) {
          startDate = new Date(lastOne[0].publish_date);
          startDate.setDate(startDate.getDate() + 1);
        }

        // 批量更新
        for (let i = 0; i < poems.length; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          
          await state.supabase
            .from('question_bank')
            .update({ publish_date: dateStr, status: 'scheduled' })
            .eq('id', poems[i].id);
        }

        showToast('自动排期完成', 'success');
        loadQuestions();
        loadCalendarData();
      } catch (err) {
        showToast('操作异常: ' + err.message, 'error');
      }
    });
    
    // 每日一题切换
    document.getElementById('toggleDailyMode')?.addEventListener('change', async (e) => {
      const next = e.target.checked;
      const toggleBtn = e.target;
      const originalState = !next;
      
      // 显示加载状态
      toggleBtn.disabled = true;
      const badge = document.getElementById('dailyModeBadge');
      badge.textContent = `更新中...`;
      badge.className = 'badge loading';
      
      try {
        const { error } = await state.supabase
          .from('app_settings')
          .upsert({ id: 'global', daily_mode_enabled: next }, { onConflict: 'id' });
        
        if (error) {
          throw new Error(error.message);
        }
        
        showToast(`每日一题模式已${next ? '开启' : '关闭'}`, 'success');
        loadAppSettings();
      } catch (error) {
        console.error('更新每日一题模式失败:', error);
        showToast('设置失败: ' + error.message, 'error');
        toggleBtn.checked = originalState;
      } finally {
        toggleBtn.disabled = false;
      }
    });

    // 日历导航
    document.getElementById('calPrev')?.addEventListener('click', () => {
      state.calMonth--;
      if (state.calMonth < 0) {
        state.calMonth = 11;
        state.calYear--;
      }
      loadCalendarData();
    });
    document.getElementById('calNext')?.addEventListener('click', () => {
      state.calMonth++;
      if (state.calMonth > 11) {
        state.calMonth = 0;
        state.calYear++;
      }
      loadCalendarData();
    });
  }

  function updateBulkActions() {
    const bar = document.getElementById('bulkActions');
    const count = document.getElementById('bulkCount');
    if (state.selectedIds.size > 0) {
      bar.style.display = 'flex';
      count.textContent = `已选中：${state.selectedIds.size}`;
    } else {
      bar.style.display = 'none';
      document.getElementById('selectAllHeader').checked = false;
    }
  }

  // --- 日历逻辑 ---
  async function loadCalendarData() {
    if (!state.supabase || !state.isAuthorized) return;

    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('calLabel');
    
    // 显示加载状态
    label.textContent = `${state.calYear}年 ${state.calMonth + 1}月 (加载中...)`;
    
    // 清除旧日期格（保留前7个星期标题）
    while (grid.children.length > 7) grid.removeChild(grid.lastChild);
    
    // 添加加载占位符
    const start = new Date(state.calYear, state.calMonth, 1);
    const firstDay = start.getDay();
    const totalDays = new Date(state.calYear, state.calMonth + 1, 0).getDate();
    
    // 空格填充
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'admin-calendar-day loading';
      empty.innerHTML = '<div class="loading-spinner-small"></div>';
      grid.appendChild(empty);
    }
    
    // 日期格加载占位符
    for (let d = 1; d <= totalDays; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'admin-calendar-day loading';
      dayEl.innerHTML = `
        <div class="day-num">${d}</div>
        <div class="day-events">
          <div class="loading-spinner-small"></div>
        </div>
      `;
      grid.appendChild(dayEl);
    }

    try {
      // 使用 DateUtils 修复查询范围（避免时区偏差）
      let startStr, endStr;
      if (window.DateUtils) {
          const range = window.DateUtils.getMonthRange(state.calYear, state.calMonth);
          startStr = range.firstDay;
          endStr = range.lastDay;
      } else {
          // 降级逻辑
          const s = new Date(state.calYear, state.calMonth, 1);
          const e = new Date(state.calYear, state.calMonth + 1, 0);
          const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          startStr = fmt(s);
          endStr = fmt(e);
      }

      const { data, error } = await state.supabase
        .from('question_bank')
        .select('id, title, status, publish_date, author')
        .gte('publish_date', startStr)
        .lte('publish_date', endStr);

      if (error) {
        throw new Error(error.message);
      }

      // 按日期分组（标准化Key）
      state.calendarData = {};
      data.forEach(q => {
        // 确保 key 是标准的 YYYY-MM-DD 格式
        const dateKey = window.DateUtils ? window.DateUtils.formatDateForStorage(q.publish_date) : q.publish_date.split('T')[0];
        
        if (!state.calendarData[dateKey]) {
          state.calendarData[dateKey] = [];
        }
        state.calendarData[dateKey].push(q);
      });

      renderCalendar();
    } catch (error) {
      console.error('日历加载失败:', error);
      label.textContent = `${state.calYear}年 ${state.calMonth + 1}月 (加载失败)`;
      showToast('日历加载失败: ' + error.message, 'error');
      
      // 显示错误状态
      const dayElements = grid.querySelectorAll('.admin-calendar-day.loading');
      dayElements.forEach(dayEl => {
        dayEl.className = 'admin-calendar-day error';
        dayEl.innerHTML = `
          <div class="day-num">${dayEl.querySelector('.day-num')?.textContent || ''}</div>
          <div class="day-events">
            <span style="color: var(--accent-color); font-size: 10px;">加载失败</span>
          </div>
        `;
      });
    }
  }

  function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('calLabel');
    label.textContent = `${state.calYear}年 ${state.calMonth + 1}月`;

    // 清除旧日期格（保留前7个星期标题）
    while (grid.children.length > 7) grid.removeChild(grid.lastChild);

    const firstDay = new Date(state.calYear, state.calMonth, 1).getDay();
    const totalDays = new Date(state.calYear, state.calMonth + 1, 0).getDate();
    
    // 使用 DateUtils 获取今天
    const todayStr = window.DateUtils ? window.DateUtils.getTodayString() : new Date().toISOString().split('T')[0];

    // 空格填充
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'admin-calendar-day other-month';
      grid.appendChild(empty);
    }

    // 填充日期
    for (let d = 1; d <= totalDays; d++) {
      let date;
      if (window.DateUtils) {
          date = window.DateUtils.formatLocalDate(new Date(state.calYear, state.calMonth, d));
      } else {
          date = `${state.calYear}-${String(state.calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
      const dayEl = document.createElement('div');
      dayEl.className = 'admin-calendar-day';
      if (date === todayStr) dayEl.classList.add('today');

      const questions = state.calendarData[date] || [];
      
      let questionsHtml = '';
      if (questions.length > 0) {
        questionsHtml = questions.map(q => `
          <div class="event-tag ${q.status}" title="${q.title} - ${q.author}">
            <span class="event-title">${q.title}</span>
            <span class="event-status">${getStatusLabel(q.status)}</span>
          </div>
        `).join('');
      } else {
        questionsHtml = '<div class="no-event">无题目</div>';
      }

      dayEl.innerHTML = `
        <div class="day-header">
          <div class="day-num">${d}</div>
          ${date === todayStr ? '<div class="today-badge">今日</div>' : ''}
        </div>
        <div class="day-events">
          ${questionsHtml}
        </div>
        <div class="day-actions">
          ${questions.length > 0 ? 
            `<button class="day-action-btn" onclick="event.stopPropagation(); editQuestion(${questions[0].id})">编辑</button>` : 
            `<button class="day-action-btn add-btn" onclick="event.stopPropagation(); addQuestionToDate('${date}')">+ 添加</button>`
          }
        </div>
      `;
      
      dayEl.addEventListener('click', () => {
        if (questions.length > 0) {
          // 如果有题目，直接编辑第一个（通常一天一个）
          editQuestion(questions[0].id);
        } else {
          // 如果没题目，弹出新增框并预填日期
          addQuestionToDate(date);
        }
      });
      grid.appendChild(dayEl);
    }
  }

  window.addQuestionToDate = (date) => {
    state.selectedId = null;
    document.getElementById('modalTitle').textContent = `新增题目 (${date})`;
    document.getElementById('questionForm').reset();
    document.getElementById('questionForm').qPublishDate.value = date;
    document.getElementById('editModal').style.display = 'block';
  };

  function showDayDetails(date, questions) {
    const panel = document.getElementById('calendarDayDetails');
    const label = document.getElementById('selectedDateLabel');
    const list = document.getElementById('dayQuestionsList');
    
    panel.style.display = 'block';
    label.textContent = date;
    
    if (questions.length === 0) {
      list.innerHTML = '<p style="opacity:0.6">当天无排期</p>';
    } else {
      list.innerHTML = questions.map(q => `
        <div class="day-q-item" style="padding: 8px; border-bottom: 1px solid #eee; display:flex; justify-content: space-between; align-items:center;">
          <span>${q.title} <small class="status-badge status-${q.status}">${getStatusLabel(q.status)}</small></span>
          <button class="btn btn-sm" onclick="editQuestion(${q.id})">编辑</button>
        </div>
      `).join('');
    }
  }

  async function loadAppSettings() {
    if (!state.supabase || !state.isAuthorized) return;
    
    const badge = document.getElementById('dailyModeBadge');
    badge.textContent = '加载中...';
    badge.className = 'badge loading';
    
    try {
      const { data, error } = await state.supabase
        .from('app_settings')
        .select('daily_mode_enabled')
        .eq('id', 'global')
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      
      const isEnabled = data?.daily_mode_enabled || false;
      document.getElementById('toggleDailyMode').checked = isEnabled;
      
      badge.textContent = `当前：${isEnabled ? '开启' : '关闭'}`;
      badge.className = `badge ${isEnabled ? 'success' : 'secondary'}`;
      
      // 更新状态描述
      const desc = document.getElementById('dailyModeDesc');
      if (desc) {
        desc.textContent = isEnabled 
          ? '开启后系统将锁定日期题目，否则随机刷新。'
          : '关闭后系统将随机显示题目，不锁定日期。';
      }
    } catch (error) {
      console.error('加载应用设置失败:', error);
      badge.textContent = '加载失败';
      badge.className = 'badge error';
      showToast('加载设置失败: ' + error.message, 'error');
    }
  }

  // --- Toast 提示 ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 启动
  init();
})();
