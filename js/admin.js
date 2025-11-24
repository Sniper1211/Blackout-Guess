(() => {
  const state = {
    supabase: null,
    user: null,
    isAdmin: false,
    showAll: false,
    selectedId: null,
    settings: { daily_mode_enabled: false },
  };

  function createClient() {
    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.warn('缺少 Supabase 配置');
      return null;
    }
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  function getDisplayName(user) {
    try {
      return (
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        user?.phone ||
        user?.id || '用户'
      );
    } catch { return '用户'; }
  }

  async function updateAuthUI() {
    const badge = document.getElementById('adminUserBadge');
    const btnLogin = document.getElementById('adminBtnLogin');
    const btnLogout = document.getElementById('adminBtnLogout');
    if (badge) badge.textContent = state.user ? `已登录：${getDisplayName(state.user)}` : '未登录';
    if (btnLogin) btnLogin.style.display = state.user ? 'none' : 'inline-block';
    if (btnLogout) btnLogout.style.display = state.user ? 'inline-block' : 'none';
  }

  async function checkAdmin() {
    if (!state.supabase || !state.user?.email) return false;
    // 先用 profiles.role 判定，再回退到 admins 表
    const { data: pData, error: pErr } = await state.supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', state.user.id)
      .limit(1);
    if (!pErr && Array.isArray(pData) && pData[0]?.role === 'admin') {
      state.isAdmin = true;
    } else {
      const { data, error } = await state.supabase
      .from('admins')
      .select('email')
      .eq('email', state.user.email)
      .limit(1);
      if (error) {
        console.warn('管理员检查失败：', error.message);
      }
      state.isAdmin = Array.isArray(data) && data.length > 0;
    }
    const gate = document.getElementById('adminGate');
    const content = document.getElementById('adminContent');
    if (state.isAdmin) {
      if (gate) gate.style.display = 'none';
      if (content) content.style.display = 'block';
    } else {
      if (gate) {
        gate.textContent = '当前账号不是管理员，请联系站点维护者添加邮箱到 admins 表';
        gate.className = 'message error';
      }
      if (content) content.style.display = 'none';
    }
    return state.isAdmin;
  }

  async function upsertProfile() {
    if (!state.supabase || !state.user) return;
    const payload = {
      user_id: state.user.id,
      email: state.user.email || null,
      display_name: getDisplayName(state.user),
    };
    // 尝试插入或更新（若有 RLS 限制更新别人记录，此处只更新自己）
    const { error } = await state.supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) {
      console.warn('同步用户档案失败：', error.message);
    }
  }

  async function bindAuth() {
    // 处理 OAuth 回跳的哈希，建立本页会话并清理 hash
    try {
      const hash = window.location.hash || '';
      const hasAuthParams = /access_token|refresh_token|error|code/i.test(hash);
      if (hasAuthParams) {
        state.supabase.auth.getSession()
          .then(({ data }) => { state.user = data?.session?.user || null; })
          .finally(() => {
            try {
              const url = new URL(window.location.href); url.hash = '';
              window.history.replaceState(null, document.title, url.toString());
            } catch {}
          });
      }
    } catch {}
    state.supabase.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null;
      updateAuthUI();
      if (state.user) { upsertProfile().then(() => checkAdmin().then(loadQuestions)); }
    });

    const { data } = await state.supabase.auth.getUser();
    state.user = data?.user || null;
    await updateAuthUI();
    if (state.user) { await upsertProfile(); await checkAdmin(); }

    document.getElementById('adminBtnLogin')?.addEventListener('click', async () => {
      try {
        // 显式指定回跳到后台页面，避免登录后落到首页
        const origin = window.location.origin;
        const redirectTo = `${origin}/admin.html`;
        await state.supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      } catch (e) {
        alert('登录失败，请稍后再试');
      }
    });
    document.getElementById('adminBtnLogout')?.addEventListener('click', async () => {
      try {
        await state.supabase.auth.signOut();
        state.user = null;
        state.isAdmin = false;
        await updateAuthUI();
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('adminGate').style.display = 'block';
      } catch {}
    });
  }

  async function loadQuestions() {
    if (!state.supabase || !state.isAdmin) return;
    const tbody = document.querySelector('#questionTable tbody');
    tbody.innerHTML = '<tr><td colspan="5">加载中…</td></tr>';
    let query = state.supabase
      .from('question_bank')
      .select('id,title,status,publish_date')
      .order('publish_date', { ascending: true, nullsFirst: true })
      .order('id', { ascending: true });
    if (!state.showAll) {
      query = query.neq('status', 'published');
    }
    const { data, error } = await query;
    if (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="error">加载失败：${error.message}</td></tr>`;
      return;
    }
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">暂无数据</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.title || ''}</td>
        <td>${r.status || ''}</td>
        <td>${r.publish_date || ''}</td>
        <td>
          <button class="btn" data-action="edit" data-id="${r.id}">编辑</button>
          <button class="btn" data-action="schedule" data-id="${r.id}">排期</button>
          <button class="btn btn-primary" data-action="publish" data-id="${r.id}">发布</button>
          <button class="btn btn-outline" data-action="delete" data-id="${r.id}">删除</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  async function loadAppSettings() {
    if (!state.supabase || !state.isAdmin) return;
    try {
      const { data, error } = await state.supabase
        .from('app_settings')
        .select('id,daily_mode_enabled')
        .eq('id', 'global')
        .limit(1);
      if (error) {
        console.warn('读取应用设置失败：', error.message);
        return;
      }
      const row = Array.isArray(data) && data[0] ? data[0] : null;
      if (!row) {
        // 若不存在，尝试插入默认（需要管理员权限）
        const { error: insErr } = await state.supabase
          .from('app_settings')
          .insert({ id: 'global', daily_mode_enabled: false });
        if (insErr) {
          console.warn('初始化应用设置失败：', insErr.message);
        }
        state.settings = { daily_mode_enabled: false };
      } else {
        state.settings = { daily_mode_enabled: !!row.daily_mode_enabled };
      }
      const chk = document.getElementById('toggleDailyMode');
      const badge = document.getElementById('dailyModeBadge');
      if (chk) chk.checked = !!state.settings.daily_mode_enabled;
      if (badge) badge.textContent = `当前：${state.settings.daily_mode_enabled ? '开启' : '关闭'}`;
    } catch (e) {
      console.warn('读取应用设置异常：', e);
    }
  }

  async function updateAppSettings(next) {
    if (!state.supabase || !state.isAdmin) return alert('无权限');
    try {
      const { error } = await state.supabase
        .from('app_settings')
        .upsert({ id: 'global', daily_mode_enabled: !!next }, { onConflict: 'id' });
      if (error) return alert('更新设置失败：' + error.message);
      state.settings.daily_mode_enabled = !!next;
      const badge = document.getElementById('dailyModeBadge');
      if (badge) badge.textContent = `当前：${state.settings.daily_mode_enabled ? '开启' : '关闭'}`;
      alert('设置已更新');
    } catch (e) {
      alert('更新设置异常');
    }
  }

  function readForm() {
    const val = id => document.getElementById(id)?.value || '';
    const enabled = document.getElementById('qEnabled')?.value === 'true';
    return {
      type: val('qType') || 'poem',
      title: val('qTitle'),
      content: val('qContent'),
      author: val('qAuthor'),
      dynasty: val('qDynasty'),
      language: val('qLang') || 'zh-CN',
      enabled,
      status: val('qStatus') || 'draft',
      publish_date: val('qPublishDate') || null,
    };
  }

  function writeForm(row) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    set('qType', row.type || 'poem');
    set('qTitle', row.title || '');
    set('qContent', row.content || '');
    set('qAuthor', row.author || '');
    set('qDynasty', row.dynasty || '');
    set('qLang', row.language || 'zh-CN');
    set('qEnabled', String(row.enabled ?? true));
    set('qStatus', row.status || 'draft');
    set('qPublishDate', row.publish_date || '');
  }

  async function createQuestion() {
    if (!state.supabase || !state.isAdmin) return alert('无权限');
    const payload = readForm();
    const { error } = await state.supabase.from('question_bank').insert(payload);
    if (error) return alert('创建失败：' + error.message);
    alert('创建成功');
    await loadQuestions();
  }

  async function updateSelected() {
    if (!state.supabase || !state.isAdmin || !state.selectedId) return alert('请先选择编辑项');
    const payload = readForm();
    const { error } = await state.supabase.from('question_bank').update(payload).eq('id', state.selectedId);
    if (error) return alert('更新失败：' + error.message);
    alert('更新成功');
    await loadQuestions();
  }

  async function schedule(id) {
    const d = document.getElementById('qPublishDate')?.value;
    if (!d) return alert('请先在表单选择发布日期');
    const { error } = await state.supabase
      .from('question_bank')
      .update({ status: 'scheduled', publish_date: d })
      .eq('id', id);
    if (error) return alert('排期失败：' + error.message);
    alert('排期成功');
    await loadQuestions();
  }

  async function publish(id) {
    const { error } = await state.supabase
      .from('question_bank')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return alert('发布失败：' + error.message);
    alert('发布成功');
    await loadQuestions();
  }

  async function remove(id) {
    if (!confirm('确认删除该题目？此操作不可恢复')) return;
    const { error } = await state.supabase.from('question_bank').delete().eq('id', id);
    if (error) return alert('删除失败：' + error.message);
    await loadQuestions();
  }

  function bindUI() {
    document.getElementById('btnCreate')?.addEventListener('click', createQuestion);
    document.getElementById('btnUpdate')?.addEventListener('click', updateSelected);
    document.getElementById('btnReload')?.addEventListener('click', loadQuestions);
    document.getElementById('btnShowAll')?.addEventListener('click', () => {
      state.showAll = !state.showAll;
      document.getElementById('btnShowAll').textContent = state.showAll ? '仅看未发布' : '显示全部';
      loadQuestions();
    });

    document.getElementById('toggleDailyMode')?.addEventListener('change', (e) => {
      const checked = !!e.target.checked;
      updateAppSettings(checked);
    });

    document.querySelector('#questionTable tbody')?.addEventListener('click', async (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const id = t.getAttribute('data-id');
      const action = t.getAttribute('data-action');
      if (!id || !action) return;

      if (action === 'edit') {
        const { data, error } = await state.supabase
          .from('question_bank')
          .select('*')
          .eq('id', id)
          .limit(1);
        if (error) return alert('读取失败：' + error.message);
        if (Array.isArray(data) && data[0]) {
          state.selectedId = data[0].id;
          writeForm(data[0]);
        }
      } else if (action === 'schedule') {
        schedule(id);
      } else if (action === 'publish') {
        publish(id);
      } else if (action === 'delete') {
        remove(id);
      }
    });
  }

  async function init() {
    state.supabase = createClient();
    // 便于在浏览器控制台直接获取 UID 等信息
    // 使用方法：supabaseClient.auth.getUser().then(({data}) => console.log(data.user?.id))
    window.supabaseClient = state.supabase;
    if (!state.supabase) return;
    bindUI();
    await bindAuth();
    if (state.isAdmin) { await loadAppSettings(); }
    await loadQuestions();
  }

  init();
})();