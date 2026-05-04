(function (window) {
    'use strict';


    function getYearMonthLocal(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }

    function getDateIsoLocal(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }


    function create(options) {
        const {
            target,
            month,                 // ✅ geen default
            data = {},
            language = 'nl',
            jumpToToday = true,    // ✅ logisch default
            selectToday = false,
            showTodayButton = false,
            showEventCount = false,
            onMonthChange = null,
            onSelect = null,
            // Time picker options
            showTimePicker = false,
            showCalendar = true,    // ✅ Show calendar (set to false for time-only)
            timeFormat = 'HH:mm',    // 'HH:mm' or 'HH:mm:ss'
            defaultTime = '12:00',   // Default time when no time is selected
            timeStep = 15            // Minutes between time options (5, 10, 15, 30)
        } = options || {};

        /* ============================
           Language
        ============================ */
        const lang =
            window.goosseCalendarLang?.[language] ??
            window.goosseCalendarLang?.nl ??
            {
                today: 'Today',
                weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            };

        const root = document.querySelector(target);
        if (!root) {
            throw new Error('GoosseCalendar: target niet gevonden');
        }

        let current;                 // ✅ ÉÉN keer
        let calendarData = data;
        let selectedTime = defaultTime;

        /* ============================
           Data loader (AJAX)
        ============================ */
        async function loadMonthData() {
            if (typeof onMonthChange !== 'function') return;

            const yearMonth = getYearMonthLocal(current);

            try {
                const result = await onMonthChange(yearMonth);
                calendarData = result && typeof result === 'object' ? result : {};
            } catch (e) {
                console.error('Calendar month load failed', e);
                calendarData = {};
            }
        }

        /* ============================
           Select helper
        ============================ */
        function selectDate(iso) {
            const events = Array.isArray(calendarData[iso]) ? calendarData[iso] : [];

            root
                .querySelectorAll('.goosse-calendar-day.selected')
                .forEach(el => el.classList.remove('selected'));

            const el = root.querySelector(
                `.goosse-calendar-day[data-date="${iso}"]`
            );
            if (el) el.classList.add('selected');

            if (typeof onSelect === 'function') {
                const result = showTimePicker
                    ? { date: iso, time: selectedTime, datetime: `${iso}T${selectedTime}` }
                    : iso;
                onSelect(result, events);
            }
        }

        /* ============================
           Time picker helpers
        ============================ */
        function generateTimeOptions() {
            const options = [];
            const includeSeconds = timeFormat === 'HH:mm:ss';

            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += timeStep) {
                    const timeString = includeSeconds
                        ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
                        : `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    options.push(timeString);
                }
            }
            return options;
        }

        function renderTimePicker() {
            if (!showTimePicker) return '';

            const timeOptions = generateTimeOptions();
            const selectTimeLabel = lang.selectTime || 'Tijd selecteren:';
            const timeSelects = timeFormat.split(':').map((part, index) => {
                const label = part === 'HH' ? 'uur' : part === 'mm' ? 'minuten' : 'seconden';
                const options = part === 'HH'
                    ? Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'))
                    : Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

                return `
                    <div class="goosse-time-select">
                        <label class="form-label small">${label}</label>
                        <select class="form-select form-select-sm goosse-time-part" data-part="${index}">
                            ${options.map(opt => `<option value="${opt}" ${opt === selectedTime.split(':')[index] ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </div>
                `;
            }).join('');

            return `
                <div class="goosse-time-picker mt-3">
                    <h6 class="mb-2">${selectTimeLabel}</h6>
                    <div class="d-flex gap-2 justify-content-center">
                        ${timeSelects}
                    </div>
                    <div class="mt-2 text-center">
                        <small class="text-muted">Geselecteerde tijd: <strong id="selectedTimeDisplay">${selectedTime}</strong></small>
                    </div>
                </div>
            `;
        }

        function updateSelectedTime() {
            const timeParts = root.querySelectorAll('.goosse-time-part');
            const parts = Array.from(timeParts).map(select => select.value);

            if (timeFormat === 'HH:mm:ss' && parts.length === 3) {
                selectedTime = `${parts[0]}:${parts[1]}:${parts[2]}`;
            } else if (timeFormat === 'HH:mm' && parts.length >= 2) {
                selectedTime = `${parts[0]}:${parts[1]}`;
            }

            const display = root.querySelector('#selectedTimeDisplay');
            if (display) display.textContent = selectedTime;
        }

        /* ============================
           INIT – ENIGE PLAATS
        ============================ */
        (async function init() {
            const today = new Date();

            if (jumpToToday) {
                current = new Date(today.getFullYear(), today.getMonth(), 1);
            } else if (month) {
                current = new Date(month + '-01');
            } else {
                current = new Date(today.getFullYear(), today.getMonth(), 1);
            }

            console.log('INIT MONTH =', getYearMonthLocal(current));

            await loadMonthData();
            render();

            if (selectToday) {
                selectDate(today.toISOString().slice(0, 10));
            }
        })();

        /* ============================
           Render kalender
        ============================ */
        function render() {
            root.innerHTML = `
<div class="goosse-calendar">
  ${showCalendar ? `
  <div class="goosse-calendar-header d-flex align-items-center gap-2 mb-2">
    <button class="btn btn-sm btn-light prev">&lt;</button>

    <strong class="flex-grow-1 text-center">
      ${current.toLocaleDateString(
                language === 'en' ? 'en-US' :
                    language === 'fr' ? 'fr-FR' :
                        language === 'de' ? 'de-DE' :
                            'nl-BE',
                { month: 'long', year: 'numeric' }
            )}
    </strong>

    <button class="btn btn-sm btn-light next">&gt;</button>

    ${showTodayButton ? `
      <button class="btn btn-sm btn-outline-primary today">
        ${lang.today}
      </button>
    ` : ''}
  </div>

  <div class="goosse-calendar-grid">
    ${renderWeekdays()}
    ${renderDays()}
  </div>
  ` : ''}

  ${showCalendar && showTimePicker ? '<hr>' : ''}

  ${renderTimePicker()}
</div>`;

            root.querySelector('.prev').onclick = async () => {
                current.setMonth(current.getMonth() - 1);
                await loadMonthData();
                render();
            };

            root.querySelector('.next').onclick = async () => {
                current.setMonth(current.getMonth() + 1);
                await loadMonthData();
                render();
            };

            if (showTodayButton) {
                root.querySelector('.today').onclick = async () => {
                    const today = new Date();
                    current = new Date(today.getFullYear(), today.getMonth(), 1);
                    await loadMonthData();
                    render();
                    selectDate(today.toISOString().slice(0, 10));
                };
            }

            root.querySelectorAll('.goosse-calendar-day').forEach(day => {
                day.onclick = () => selectDate(day.dataset.date);
            });

            if (showTimePicker) {
                root.querySelectorAll('.goosse-time-part').forEach(select => {
                    select.onchange = updateSelectedTime;
                });
            }
        }

        function renderWeekdays() {
            return lang.weekdays
                .map(d =>
                    `<div class="goosse-calendar-weekday text-center small text-muted">${d}</div>`
                )
                .join('');
        }

        function renderDays() {
            const y = current.getFullYear();
            const m = current.getMonth();
            const daysInMonth = new Date(y, m + 1, 0).getDate();

            const todayIso = new Date().toISOString().slice(0, 10);
            let html = '';

            for (let d = 1; d <= daysInMonth; d++) {
                const iso =
                    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                const events = Array.isArray(calendarData[iso]) ? calendarData[iso] : [];
                const classes = ['goosse-calendar-day'];

                if (events.length > 0) {
                    classes.push('has-data');
                    classes.push(
                        events.some(e => e.status === 'active')
                            ? 'status-active'
                            : 'status-inactive'
                    );
                }

                if (iso === todayIso) {
                    classes.push('today');
                }

                const countBadge =
                    showEventCount && events.length > 0
                        ? `<span class="goosse-calendar-count">${events.length}</span>`
                        : '';

                html += `
<div class="${classes.join(' ')}" data-date="${iso}">
  <span class="goosse-calendar-day-number">${d}</span>
  ${countBadge}
</div>`;
            }

            return html;
        }
    }

    window.goosseCalendar = { create };

})(window);