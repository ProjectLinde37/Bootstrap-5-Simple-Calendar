(function (window) {
    'use strict';

    function create(options) {
        const {
            target,
            month,
            data = {},
            language = 'nl',

            /* kalender */
            jumpToToday = true,
            selectToday = false,
            showTodayButton = false,
            showEventCount = false,

            /* tijd */
            showTimePicker = false,
            showCalendar = true,
            timeFormat = 'HH:mm',
            defaultTime = null,
            timeStep = 15,

            onMonthChange = null,
            onSelect = null
        } = options || {};

        /* ============================
           Helpers – datum & tijd
        ============================ */
        function pad(n) {
            return String(n).padStart(2, '0');
        }

        function getDateIsoLocal(d) {
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        }

        function getYearMonthLocal(d) {
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        }

        /* ============================
           DOM root
        ============================ */
        const root = document.querySelector(target);
        if (!root) throw new Error('GoosseCalendar: target niet gevonden');

        let current;
        let calendarData = data;

        let selectedDate = null;
        let selectedTime = defaultTime;

        /* ============================
           INIT
        ============================ */
        (async function init() {
            const today = new Date();

            if (jumpToToday || !month) {
                current = new Date(today.getFullYear(), today.getMonth(), 1);
            } else {
                current = new Date(month + '-01');
            }

            if (typeof onMonthChange === 'function') {
                const ym = getYearMonthLocal(current);
                calendarData = await onMonthChange(ym) || {};
            }

            if (selectToday && showCalendar) {
                selectedDate = getDateIsoLocal(today);
            }

            render();

            // ✅ FIX: time-only moet defaultTime onmiddellijk doorgeven
            if (showTimePicker && !showCalendar && selectedTime) {
                fireSelect();
            }
        })();

        /* ============================
           Render
        ============================ */
        function render() {
            root.innerHTML = '';

            if (showCalendar) {
                root.appendChild(renderCalendar());
            }

            if (showTimePicker) {
                root.appendChild(renderTimePicker());
            }
        }

        /* ============================
           Kalender
        ============================ */
        function renderCalendar() {
            const wrapper = document.createElement('div');
            wrapper.className = 'goosse-calendar';

            wrapper.innerHTML = `
<div class="goosse-calendar-header d-flex align-items-center gap-2 mb-2">
  <button class="btn btn-sm btn-light prev">&lt;</button>
  <strong class="flex-grow-1 text-center">
    ${current.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-BE', {
                month: 'long',
                year: 'numeric'
            })}
  </strong>
  <button class="btn btn-sm btn-light next">&gt;</button>
</div>
<div class="goosse-calendar-grid">
  ${renderDays()}
</div>`;

            wrapper.querySelector('.prev').onclick = async () => {
                current.setMonth(current.getMonth() - 1);
                await reloadMonth();
            };

            wrapper.querySelector('.next').onclick = async () => {
                current.setMonth(current.getMonth() + 1);
                await reloadMonth();
            };

            wrapper.querySelectorAll('.goosse-calendar-day').forEach(el => {
                el.onclick = () => {
                    selectedDate = el.dataset.date;
                    fireSelect();
                };
            });

            return wrapper;
        }

        async function reloadMonth() {
            if (typeof onMonthChange === 'function') {
                calendarData = await onMonthChange(getYearMonthLocal(current)) || {};
            }
            render();
        }

        function renderDays() {
            const y = current.getFullYear();
            const m = current.getMonth();
            const days = new Date(y, m + 1, 0).getDate();

            let html = '';
            for (let d = 1; d <= days; d++) {
                const iso = `${y}-${pad(m + 1)}-${pad(d)}`;
                html += `
<div class="goosse-calendar-day"
     data-date="${iso}">
  ${d}
</div>`;
            }
            return html;
        }

        /* ============================
           Time picker
        ============================ */
        function renderTimePicker() {
            const wrapper = document.createElement('div');
            wrapper.className = 'mt-2';

            const label = document.createElement('label');
            label.className = 'form-label mb-1';
            label.textContent = 'Tijd selecteren:';
            wrapper.appendChild(label);

            const row = document.createElement('div');
            row.className = 'd-flex align-items-center gap-2';

            const withSeconds = timeFormat === 'HH:mm:ss';

            let [h, m, s] = (selectedTime || '00:00:00').split(':');
            s = s || '00';

            function createSelect(labelText, max, value, step = 1) {
                const container = document.createElement('div');
                container.className = 'text-center';

                const lbl = document.createElement('div');
                lbl.className = 'small text-muted mb-1';
                lbl.textContent = labelText;

                const sel = document.createElement('select');
                sel.className = 'form-select form-select-sm';
                sel.style.minWidth = '70px';

                for (let i = 0; i < max; i += step) {
                    const v = String(i).padStart(2, '0');
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v;
                    if (v === value) opt.selected = true;
                    sel.appendChild(opt);
                }

                container.appendChild(lbl);
                container.appendChild(sel);

                return { container, select: sel };
            }

            const hour = createSelect('uur', 24, h);
            const minute = createSelect('minuten', 60, m, timeStep);
            const second = withSeconds
                ? createSelect('seconden', 60, s, timeStep)
                : null;

            function updateTime() {
                selectedTime = withSeconds
                    ? `${hour.select.value}:${minute.select.value}:${second.select.value}`
                    : `${hour.select.value}:${minute.select.value}`;

                fireSelect();
            }

            hour.select.onchange = updateTime;
            minute.select.onchange = updateTime;
            if (second) second.select.onchange = updateTime;

            row.appendChild(hour.container);
            row.appendChild(document.createTextNode(':'));
            row.appendChild(minute.container);

            if (withSeconds) {
                row.appendChild(document.createTextNode(':'));
                row.appendChild(second.container);
            }

            // ✅ NIEUW: initieel synchroniseren
            updateTime();

            wrapper.appendChild(row);

            return wrapper;
        }


        /* ============================
           onSelect dispatcher
        ============================ */
        function fireSelect() {
            if (typeof onSelect !== 'function') return;

            onSelect({
                date: showCalendar ? selectedDate : null,
                time: showTimePicker ? selectedTime : null
            }, []);
        }
    }

    window.goosseCalendar = { create };

})(window);