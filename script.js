    (() => {
      'use strict';
      const $ = (s, c = document) => c.querySelector(s);
      const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

      /* ---------- Demo data (clearly labelled sample data) ---------- */
      const state = {
        tab: 'pending',
        editingId: null,
        requests: [
          { id: 1, company: 'Bright Star Inc.', amount: 280, currency: 'CAD' },
          { id: 2, company: 'TechLine Inc.', amount: 356, currency: 'USD' },
          { id: 3, company: 'Global Solutions Ltd.', amount: 677, currency: 'USD' }
        ]
      };

      const fmt = n => n.toFixed(2).replace('.', ',');

      /* ---------- Elements ---------- */
      const requestList = $('#request-list');
      const pendingEmpty = $('#pending-empty');
      const panelPending = $('#panel-pending');
      const panelCompleted = $('#panel-completed');
      const tabPending = $('#tab-pending');
      const tabCompleted = $('#tab-completed');
      const toastRegion = $('#toast-region');
      const overlay = $('#overlay');
      const editDialog = $('#edit-dialog');
      const confirmDialog = $('#confirm-dialog');
      const amountInput = $('#amount-input');
      const amountError = $('#amount-error');
      const editSub = $('#edit-sub');
      const editCurrency = $('#edit-currency');
      const confirmBody = $('#confirm-body');
      const menuBtn = $('#menu-btn');
      const appMenu = $('#app-menu');

      /* ---------- Toasts ---------- */
      function toast(message) {
        const el = document.createElement('div');
        el.className = 'toast pointer-events-auto flex max-w-full items-start gap-2.5 rounded-2xl bg-[#26243d] px-4 py-3 text-sm text-white shadow-xl sm:items-center';
        el.innerHTML =
          '<svg class="mt-0.5 h-4 w-4 shrink-0 text-[#948bff] sm:mt-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
          '<path fill-rule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 1 0 2 0v-3a1 1 0 1 0 0-2V9Z" clip-rule="evenodd"/></svg><span></span>';
        el.lastElementChild.textContent = message;
        toastRegion.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast-in')));
        setTimeout(() => {
          el.classList.add('toast-out');
          setTimeout(() => el.remove(), 300);
        }, 4200);
      }

      /* ---------- Rendering ---------- */
      const pillBtn =
        'min-w-0 px-2 py-2.5 text-[13.5px] leading-snug font-medium text-accent transition-colors ' +
        'hover:bg-accent/[0.06] active:bg-accent/[0.12] focus-visible:outline-none focus-visible:bg-accent/10 ' +
        'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-4 sm:text-[15px]';

      function requestHTML(r) {
        return (
          '<article>' +
            '<h3 class="text-[17px] font-bold text-ink">' + r.company + '</h3>' +
            '<p class="mt-0.5 text-[15.5px] text-body sm:text-base">Payment request for ' + fmt(r.amount) + ' ' + r.currency + ' sent</p>' +
            '<p class="mt-4 text-[13px] text-muted sm:text-sm">' + r.company + ' hasn\u2019t paid yet</p>' +
            '<div role="group" aria-label="Actions for the ' + fmt(r.amount) + ' ' + r.currency + ' payment request to ' + r.company + '" ' +
              'class="mt-4 grid grid-cols-[1.5fr_1.05fr_0.78fr] overflow-hidden rounded-full border-2 border-accent bg-white">' +
              '<button type="button" data-action="reminder" class="' + pillBtn + '">Send a reminder</button>' +
              '<button type="button" data-action="edit" class="' + pillBtn + ' border-l-2 border-accent">Edit amount</button>' +
              '<button type="button" data-action="cancel" class="' + pillBtn + ' border-l-2 border-accent">Cancel</button>' +
            '</div>' +
          '</article>'
        );
      }

      function render() {
        requestList.innerHTML = state.requests
          .map(r => '<li data-id="' + r.id + '">' + requestHTML(r) + '</li>')
          .join('');
        const empty = state.requests.length === 0;
        requestList.classList.toggle('hidden', empty);
        pendingEmpty.hidden = !empty;
      }

      /* ---------- Status tabs ---------- */
      function paintTabs() {
        const p = state.tab === 'pending';
        tabPending.setAttribute('aria-selected', String(p));
        tabCompleted.setAttribute('aria-selected', String(!p));
        tabPending.tabIndex = p ? 0 : -1;
        tabCompleted.tabIndex = p ? -1 : 0;
        tabPending.classList.toggle('text-ink', p);
        tabPending.classList.toggle('text-ink/55', !p);
        tabCompleted.classList.toggle('text-white', !p);
        tabCompleted.classList.toggle('text-white/70', p);
        $('.tab-underline', tabPending).classList.toggle('opacity-0', !p);
        $('.tab-underline', tabCompleted).classList.toggle('opacity-0', p);
        panelPending.hidden = !p;
        panelCompleted.hidden = p;
      }

      function selectTab(name, moveFocus) {
        state.tab = name;
        paintTabs();
        if (moveFocus) (name === 'pending' ? tabPending : tabCompleted).focus();
      }

      tabPending.addEventListener('click', () => selectTab('pending'));
      tabCompleted.addEventListener('click', () => selectTab('completed'));
      $('#tab-row').addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          selectTab(state.tab === 'pending' ? 'completed' : 'pending', true);
        }
      });

      /* ---------- Top navigation ---------- */
      const navMessages = {
        activity: '\u201CActivity\u201D is a demo link — this prototype only includes the Summary view.',
        send: '\u201CSend/request\u201D is a demo link — this prototype only includes the Summary view.'
      };
      const navBtns = $$('.nav-link');
      navBtns.forEach(btn => btn.addEventListener('click', () => {
        navBtns.forEach(b => {
          const active = b === btn;
          b.classList.toggle('text-white', active);
          b.classList.toggle('text-white/75', !active);
          if (active) b.setAttribute('aria-current', 'page');
          else b.removeAttribute('aria-current');
        });
        if (btn.dataset.view !== 'summary') toast(navMessages[btn.dataset.view]);
      }));

      /* ---------- Hamburger menu ---------- */
      let menuOpen = false;
      function setMenu(open, restoreFocus = true) {
        if (open === menuOpen) return;
        menuOpen = open;
        appMenu.classList.toggle('is-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open) {
          const first = $('button', appMenu);
          if (first) first.focus();
        } else if (restoreFocus) {
          menuBtn.focus();
        }
      }
      menuBtn.addEventListener('click', () => setMenu(!menuOpen));
      document.addEventListener('click', e => {
        if (menuOpen && !e.target.closest('#app-menu, #menu-btn')) setMenu(false, false);
      });
      $$('#app-menu [data-menu-item]').forEach(item => item.addEventListener('click', () => {
        setMenu(false);
        toast('\u201C' + item.textContent.trim() + '\u201D isn\u2019t wired up in this demo.');
      }));

      /* ---------- Dialog plumbing ---------- */
      let openDlg = null;
      let lastFocus = null;

      function openDialog(dlg, focusEl) {
        lastFocus = document.activeElement;
        openDlg = dlg;
        overlay.classList.add('is-open');
        dlg.classList.add('is-open');
        (focusEl || $('input, button', dlg)).focus();
      }

      function closeDialog() {
        if (!openDlg) return;
        openDlg.classList.remove('is-open');
        overlay.classList.remove('is-open');
        openDlg = null;
        if (lastFocus && lastFocus.isConnected) lastFocus.focus();
        lastFocus = null;
      }

      overlay.addEventListener('click', closeDialog);
      $$('[data-dialog-close]').forEach(b => b.addEventListener('click', closeDialog));

      function trapTab(e, container) {
        const focusables = $$('button, input, [href], select, textarea', container).filter(el => !el.disabled);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          if (openDlg) closeDialog();
          else if (menuOpen) setMenu(false);
          return;
        }
        if (e.key === 'Tab' && openDlg) trapTab(e, openDlg);
      });

      /* ---------- Request actions ---------- */
      requestList.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const li = btn.closest('li[data-id]');
        const r = state.requests.find(x => x.id === Number(li.dataset.id));
        if (!r) return;
        switch (btn.dataset.action) {
          case 'reminder':
            toast('Reminder sent to ' + r.company + ' about ' + fmt(r.amount) + ' ' + r.currency + ' — demo only, nothing was actually sent.');
            break;
          case 'edit':
            openEdit(r);
            break;
          case 'cancel':
            openConfirm(r);
            break;
        }
      });

      /* ---------- Edit amount ---------- */
      function clearAmountError() {
        amountError.hidden = true;
        amountInput.removeAttribute('aria-invalid');
      }
      function showAmountError(msg) {
        amountError.textContent = msg;
        amountError.hidden = false;
        amountInput.setAttribute('aria-invalid', 'true');
      }
      amountInput.addEventListener('input', clearAmountError);

      function openEdit(r) {
        state.editingId = r.id;
        editSub.textContent = 'Payment request to ' + r.company;
        editCurrency.textContent = r.currency;
        amountInput.value = r.amount.toFixed(2);
        clearAmountError();
        openDialog(editDialog, amountInput);
        amountInput.select();
      }

      $('#edit-form').addEventListener('submit', e => {
        e.preventDefault();
        const raw = amountInput.value.trim().replace(',', '.');
        const n = Number(raw);
        if (raw === '' || !Number.isFinite(n) || n <= 0) {
          showAmountError('Enter a positive amount, for example 250.00.');
          amountInput.focus();
          return;
        }
        const r = state.requests.find(x => x.id === state.editingId);
        if (!r) { closeDialog(); return; }
        r.amount = Math.round(n * 100) / 100;
        render();
        closeDialog();
        toast('Amount updated — the request now shows ' + fmt(r.amount) + ' ' + r.currency + ' (demo).');
        const fresh = $('#request-list li[data-id="' + r.id + '"] button[data-action="edit"]');
        if (fresh) fresh.focus();
      });

      /* ---------- Cancel request (with confirmation) ---------- */
      let cancellingId = null;

      function openConfirm(r) {
        cancellingId = r.id;
        confirmBody.textContent = 'The payment request for ' + fmt(r.amount) + ' ' + r.currency + ' to ' + r.company +
          ' will be removed from this list. This can\u2019t be undone.';
        openDialog(confirmDialog, $('#confirm-keep'));
      }

      $('#confirm-remove').addEventListener('click', () => {
        const r = state.requests.find(x => x.id === cancellingId);
        closeDialog();
        if (!r) return;
        const li = $('#request-list li[data-id="' + r.id + '"]');
        if (li) li.classList.add('removing');
        window.setTimeout(() => {
          state.requests = state.requests.filter(x => x.id !== r.id);
          render();
          panelPending.focus({ preventScroll: true });
          toast('Payment request for ' + fmt(r.amount) + ' ' + r.currency + ' cancelled (demo — no funds involved).');
        }, 240);
      });

      /* ---------- Init ---------- */
      render();
      paintTabs();
    })();
