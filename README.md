# Goosse Calendar Module

Reusable JavaScript module for **interactive calendars**.  
Built on top of **Bootstrap 5** (JS + CSS).

✅ No static HTML in layouts  
✅ On‑demand DOM injection  
✅ Self‑rendering  
✅ Event data support  
✅ Multi‑language support  
✅ MVC‑compliant  
✅ Production‑first  

---
## Demo

Live demo of the Goosse Calendar component:

👉 [View the Goosse Calendar demo](https://projectlinde37.github.io/Bootstrap-5-Simple-Calendar/)

The demo showcases:
- Month navigation
- Date selection
- Event indicators
- Today button
- Multi-language support

---

## 📁 Location

```text
public/goosse/Boostrap-5-Simple-Calendar/
├── calendar.js
├── calendar.css
├── lang/
│   ├── en.js
│   ├── nl.js
│   ├── fr.js
│   └── de.js
├── api/
│   ├── calendar.json
│   └── YYYY-MM.json (per month)
├── docs/
│   ├── index.html
│   ├── ajax.html
│   ├── datepicker.html
│   ├── timepicker.html
│   └── navigation.js
├── README.md
└── .gitattributes
```

This module intentionally lives in `public/`:

*   it is **client‑side UI behaviour**
*   no business logic
*   no server state

***

## 🔧 Requirements

*   **Bootstrap 5.3.x (JS + CSS)**
*   Modern browser

> ⚠️ **Tabler JS is NOT used**\
> Bootstrap JS is explicitly loaded to provide base styling.

***

## 📦 Installation

### 1️⃣ Place the files

Copy the calendar files to your public directory:

```text
public/goosse/Boostrap-5-Simple-Calendar/
├── calendar.js
├── calendar.css
├── lang/ (optional, for multi-language support)
└── api/ (optional, for AJAX demos)
```

### 2️⃣ Load scripts in your layout (once)

For example in `Views/layouts/admin.php`:

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Goosse Calendar CSS -->
<link href="public/goosse/Boostrap-5-Simple-Calendar/calendar.css" rel="stylesheet">

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Optional: Load language file -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/nl.js"></script>

<!-- Goosse Calendar JS -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/calendar.js"></script>
```

✅ Bootstrap JS is the only JS framework\
✅ No Tabler JS\
✅ No double initialisation

***

## 🚀 Usage

### Basic Calendar

```html
<div id="my-calendar"></div>
```

```js
goosseCalendar.create({
    target: '#my-calendar'
});
```

### Calendar with Events

```js
goosseCalendar.create({
    target: '#my-calendar',
    data: {
        '2023-12-25': [
            { title: 'Christmas Day', status: 'active' }
        ],
        '2023-12-31': [
            { title: 'New Year\'s Eve', status: 'inactive' }
        ]
    },
    onSelect: (date, events) => {
        console.log('Selected date:', date);
        console.log('Events:', events);
    }
});
```

### Calendar with Today Features

```js
goosseCalendar.create({
    target: '#my-calendar',
    jumpToToday: true,
    selectToday: true,
    showTodayButton: true,
    showEventCount: true
});
```

### Calendar with Time Picker

```js
goosseCalendar.create({
    target: '#my-calendar',
    showTimePicker: true,
    timeFormat: 'HH:mm',    // or 'HH:mm:ss'
    defaultTime: '09:00',
    timeStep: 15,           // 5, 10, 15, or 30 minutes
    onSelect: (result, events) => {
        if (typeof result === 'object') {
            console.log('Date:', result.date);
            console.log('Time:', result.time);
            console.log('DateTime:', result.datetime);
        } else {
            console.log('Date only:', result);
        }
    }
});
```

When `showTimePicker` is enabled, the `onSelect` callback receives an object with `date`, `time`, and `datetime` properties instead of just the date string.

### Time Picker Only (No Calendar)

```html
<div id="time-only"></div>
```

```js
goosseCalendar.create({
    target: '#time-only',
    showCalendar: false,    // Hide calendar grid
    showTimePicker: true,   // Show only time picker
    timeFormat: 'HH:mm',
    defaultTime: '09:00',
    onSelect: (result) => {
        console.log('Selected time:', result.time);
        console.log('DateTime:', result.datetime);
    }
});
```

### Advanced: AJAX Data Loading

For dynamic calendars with server-loaded data per month:

```html
<div class="row g-3">
    <!-- Calendar -->
    <div class="col-12 col-md-5">
        <div id="calendar"></div>
    </div>
    <!-- Day Details -->
    <div class="col-12 col-md-7">
        <div id="dayDetails">Click a date to view details.</div>
    </div>
</div>
```

```js
// Render day details
function renderDayDetails(date, events) {
    const container = document.getElementById('dayDetails');
    
    if (!events || events.length === 0) {
        container.innerHTML = `<h5>${date}</h5><p>No events for this day.</p>`;
        return;
    }
    
    container.innerHTML = `
        <h5>${date}</h5>
        <ul class="list-group mt-3">
            ${events.map(e => `
                <li class="list-group-item">
                    <strong>${e.label}</strong><br>
                    <small class="text-muted">
                        ${e.start && e.end ? `${e.start} – ${e.end}` : 'All day'}
                    </small>
                </li>
            `).join('')}
        </ul>
    `;
}

// Initialize calendar with month-based AJAX loading
goosseCalendar.create({
    target: '#calendar',
    language: 'en',
    jumpToToday: true,
    selectToday: true,
    showTodayButton: true,
    showEventCount: true,
    
    // Load data for each month when navigating
    onMonthChange: async (month) => {
        try {
            const response = await fetch(`api/${month}.json`, {
                headers: { Accept: 'application/json' }
            });
            
            if (!response.ok) {
                return {}; // Empty month if file doesn't exist
            }
            
            return await response.json();
        } catch {
            return {}; // Empty month on network error
        }
    },
    
    onSelect: (date, events) => {
        renderDayDetails(date, events);
    }
});
```

This approach loads calendar data **per month** when navigating, keeping the initial load fast and memory usage low. Missing month files (404) result in empty months.

See the full demo: [`docs/ajax.html`](docs/ajax.html)

***
## 🧠 Options

| Option           | Type     | Default       | Description                                      |
| ---------------- | -------- | ------------- | ------------------------------------------------ |
| `target`         | string   | (required)    | CSS selector for the calendar container          |
| `month`          | string   | current month | ISO month string (YYYY-MM)                       |
| `data`           | object   | `{}`          | Event data keyed by ISO date (YYYY-MM-DD)        |
| `language`       | string   | `'nl'`        | Language code ('en', 'nl', 'fr', 'de')           |
| `jumpToToday`    | boolean  | `true`        | Start calendar on current month                  |
| `selectToday`    | boolean  | `false`       | Auto-select today's date                         |
| `showTodayButton`| boolean  | `false`       | Show "Today" button in header                    |
| `showEventCount` | boolean  | `false`       | Show event count badges on days                  |
| `showCalendar`   | boolean  | `true`        | Show calendar grid (set to false for time-only)  |
| `onMonthChange`  | function | `null`        | Callback to load data for a month (month)        |
| `onSelect`       | function | `null`        | Callback when date is selected (date/time, events)|
| `showTimePicker` | boolean  | `false`       | Show time selection below calendar               |
| `timeFormat`     | string   | `'HH:mm'`     | Time format: 'HH:mm' or 'HH:mm:ss'               |
| `defaultTime`    | string   | `'12:00'`     | Default time when no time is selected            |
| `timeStep`       | number   | `15`          | Minutes between time options (5, 10, 15, 30)    |

### Event Data Structure

The calendar accepts flexible event objects. Only the `status` field affects styling:

```js
data: {
    '2023-12-25': [
        {
            label: 'Christmas Day',    // Display label (for your app)
            status: 'active',          // 'active' or 'inactive' (affects CSS)
            start: '09:00',            // Optional: start time
            end: '17:00'               // Optional: end time
            // ... other custom fields
        }
    ]
}
```

The calendar uses `status` for visual indicators and event count badges.

***

## 🌐 Language Support

The calendar supports multiple languages via external language files.

### Supported Languages

- `en` - English
- `nl` - Dutch (default)
- `fr` - French
- `de` - German

### Language File Structure

Language files define translations for calendar elements:

```js
window.goosseCalendarLang = window.goosseCalendarLang || {};

window.goosseCalendarLang.nl = {
    today: 'Vandaag',
    noEvents: 'Geen planning voor deze dag',
    weekdays: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
    dateFormat: 'DD-MM-YYYY',
    selectTime: 'Tijd selecteren:'
};
```

### Loading Language Files

Load language files before initializing the calendar:

```html
<!-- Load Dutch language (default) -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/nl.js"></script>

<!-- Or load English -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/en.js"></script>

<!-- Then load calendar -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/calendar.js"></script>
```

### Custom Language

You can also define custom languages directly:

```js
window.goosseCalendarLang = {
    custom: {
        today: 'Today',
        noEvents: 'No events',
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dateFormat: 'YYYY-MM-DD',
        selectTime: 'Select time:'
    }
};
```

Then use it with `language: 'custom'`.

***

## 🚀 API Methods

### ✅ `goosseCalendar.create(options)`

Creates and renders a calendar instance.

```js
const calendar = goosseCalendar.create({
    target: '#calendar',
    // ... options
});
```

Returns the calendar instance (currently no methods exposed).

***

## 🎨 Styling (`calendar.css`)

### Day States

```css
.goosse-calendar-day {
    /* Base day styling */
}

.goosse-calendar-day.today {
    /* Today highlight */
}

.goosse-calendar-day.selected {
    /* Selected day */
}

.goosse-calendar-day.has-data {
    /* Days with events */
}

.goosse-calendar-day.status-active {
    /* Active events */
}

.goosse-calendar-day.status-inactive {
    /* Inactive events */
}
```

### Event Count Badge

```css
.goosse-calendar-count {
    /* Event count styling */
}
```

### Time Picker

```css
.goosse-time-picker {
    /* Time picker container */
}

.goosse-time-select {
    /* Individual time select wrapper */
}

.goosse-time-part {
    /* Time select dropdowns */
}
```

***

## 🔒 Security & Accessibility

*   ✅ Bootstrap handles base accessibility
*   ✅ No inline `eval`
*   ✅ Client-side only (no server security implications)
*   ✅ HTML escaping for event titles

***

## ❌ What this module deliberately does NOT do

*   ❌ no built‑in AJAX (but works great with fetch/XMLHttpRequest)
*   ❌ no data persistence
*   ❌ no business logic
*   ❌ no static HTML
*   ❌ no Tabler JS dependency

***

## ✅ Architectural Decisions

*   **Tabler = CSS theme**
*   **Bootstrap = base styling**
*   **Goosse Calendar = reusable UI module**
*   Event status affects visual styling
*   Language files for i18n support

***

## ✅ Summary

*   ✅ Simple API with flexible options
*   ✅ Event data integration
*   ✅ Multi-language support
*   ✅ Bootstrap-native styling
*   ✅ Time picker with customizable format
*   ✅ Calendar-only or time-only modes
*   ✅ AJAX data loading per month
*   ✅ Production-ready
