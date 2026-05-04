# Goosse Kalender Module

Herbruikbare JavaScript module voor **interactieve kalenders**.  
Gebouwd op **Bootstrap 5** (JS + CSS).

✅ Geen statische HTML in layouts  
✅ On‑demand DOM injectie  
✅ Self‑rendering  
✅ Event data ondersteuning  
✅ Multi‑taal ondersteuning  
✅ MVC‑compliant  
✅ Production‑first  

---
## Demo

Live demo van de Goosse Calendar component:

👉 [Bekijk de Goosse Calendar demo](https://projectlinde37.github.io/Bootstrap-5-Simple-Calendar/)

De demo toont:
- Maand navigatie
- Datum selectie
- Event indicatoren
- Vandaag knop
- Multi-taal ondersteuning

---

## 📁 Locatie

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
│   └── YYYY-MM.json (per maand)
├── docs/
│   ├── index.html
│   ├── ajax.html
│   ├── datepicker.html
│   ├── timepicker.html
│   └── navigation.js
├── README.md
└── .gitattributes
```

Deze module leeft bewust in `public/`:

*   het is **client‑side UI gedrag**
*   geen business logica
*   geen server state

***

## 🔧 Vereisten

*   **Bootstrap 5.3.x (JS + CSS)**
*   Moderne browser

> ⚠️ **Tabler JS wordt NIET gebruikt**\
> Bootstrap JS wordt expliciet geladen om base styling te bieden.

***

## 📦 Installatie

### 1️⃣ Plaats de bestanden

Kopieer de kalender bestanden naar je public directory:

```text
public/goosse/Boostrap-5-Simple-Calendar/
├── calendar.js
├── calendar.css
├── lang/ (optioneel, voor multi-taal ondersteuning)
└── api/ (optioneel, voor AJAX demos)
```

### 2️⃣ Laad scripts in je layout (eenmalig)

Bijvoorbeeld in `Views/layouts/admin.php`:

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Goosse Calendar CSS -->
<link href="public/goosse/Boostrap-5-Simple-Calendar/calendar.css" rel="stylesheet">

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Optioneel: Laad taalbestand -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/nl.js"></script>

<!-- Goosse Calendar JS -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/calendar.js"></script>
```

✅ Bootstrap JS is het enige JS framework\
✅ Geen Tabler JS\
✅ Geen dubbele initialisatie

***

## 🚀 Gebruik

### Basis Kalender

```html
<div id="my-calendar"></div>
```

```js
goosseCalendar.create({
    target: '#my-calendar'
});
```

### Kalender met Events

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
        console.log('Geselecteerde datum:', date);
        console.log('Events:', events);
    }
});
```

### Kalender met Vandaag Features

```js
goosseCalendar.create({
    target: '#my-calendar',
    jumpToToday: true,
    selectToday: true,
    showTodayButton: true,
    showEventCount: true
});
```

### Kalender met Tijd Picker

```js
goosseCalendar.create({
    target: '#my-calendar',
    showTimePicker: true,
    timeFormat: 'HH:mm',    // of 'HH:mm:ss'
    defaultTime: '09:00',
    timeStep: 15,           // 5, 10, 15, of 30 minuten
    onSelect: (result, events) => {
        if (typeof result === 'object') {
            console.log('Datum:', result.date);
            console.log('Tijd:', result.time);
            console.log('DatumTijd:', result.datetime);
        } else {
            console.log('Alleen datum:', result);
        }
    }
});
```

Wanneer `showTimePicker` is ingeschakeld, ontvangt de `onSelect` callback een object met `date`, `time`, en `datetime` eigenschappen in plaats van alleen de datum string.

### Tijd Picker Alleen (Geen Kalender)

```html
<div id="time-only"></div>
```

```js
goosseCalendar.create({
    target: '#time-only',
    showCalendar: false,    // Verberg kalender grid
    showTimePicker: true,   // Toon alleen tijd picker
    timeFormat: 'HH:mm',
    defaultTime: '09:00',
    onSelect: (result) => {
        console.log('Geselecteerde tijd:', result.time);
        console.log('DatumTijd:', result.datetime);
    }
});
```

### Geavanceerd: AJAX Data Loading

Voor dynamische kalenders met server-geladen data per maand:

```html
<div class="row g-3">
    <!-- Kalender -->
    <div class="col-12 col-md-5">
        <div id="calendar"></div>
    </div>
    <!-- Dag Details -->
    <div class="col-12 col-md-7">
        <div id="dayDetails">Klik op een datum om details te bekijken.</div>
    </div>
</div>
```

```js
// Render dag details
function renderDayDetails(date, events) {
    const container = document.getElementById('dayDetails');
    
    if (!events || events.length === 0) {
        container.innerHTML = `<h5>${date}</h5><p>Geen events voor deze dag.</p>`;
        return;
    }
    
    container.innerHTML = `
        <h5>${date}</h5>
        <ul class="list-group mt-3">
            ${events.map(e => `
                <li class="list-group-item">
                    <strong>${e.label}</strong><br>
                    <small class="text-muted">
                        ${e.start && e.end ? `${e.start} – ${e.end}` : 'Hele dag'}
                    </small>
                </li>
            `).join('')}
        </ul>
    `;
}

// Initialiseer kalender met maand-gebaseerde AJAX loading
goosseCalendar.create({
    target: '#calendar',
    language: 'en',
    jumpToToday: true,
    selectToday: true,
    showTodayButton: true,
    showEventCount: true,
    
    // Laad data voor elke maand bij navigeren
    onMonthChange: async (month) => {
        try {
            const response = await fetch(`api/${month}.json`, {
                headers: { Accept: 'application/json' }
            });
            
            if (!response.ok) {
                return {}; // Lege maand als bestand niet bestaat
            }
            
            return await response.json();
        } catch {
            return {}; // Lege maand bij netwerk fout
        }
    },
    
    onSelect: (date, events) => {
        renderDayDetails(date, events);
    }
});
```

Deze aanpak laadt kalender data **per maand** bij navigeren, waardoor de initiële load snel blijft en geheugengebruik laag. Ontbrekende maand bestanden (404) resulteren in lege maanden.

Zie de volledige demo: [`docs/ajax.html`](docs/ajax.html)

***
## 🧠 Opties

| Optie            | Type     | Standaard     | Beschrijving                                      |
| ---------------- | -------- | ------------- | ------------------------------------------------ |
| `target`         | string   | (vereist)    | CSS selector voor de kalender container          |
| `month`          | string   | huidige maand| ISO maand string (YYYY-MM)                       |
| `data`           | object   | `{}`          | Event data gekoppeld aan ISO datum (YYYY-MM-DD)  |
| `language`       | string   | `'nl'`        | Taal code ('en', 'nl', 'fr', 'de')               |
| `jumpToToday`    | boolean  | `true`        | Start kalender op huidige maand                  |
| `selectToday`    | boolean  | `false`       | Auto-selecteer vandaag                           |
| `showTodayButton`| boolean  | `false`       | Toon "Vandaag" knop in header                    |
| `showEventCount` | boolean  | `false`       | Toon event count badges op dagen                 |
| `showCalendar`   | boolean  | `true`        | Toon kalender grid (zet op false voor tijd-only) |
| `onMonthChange`  | function | `null`        | Callback om data voor een maand te laden (month) |
| `onSelect`       | function | `null`        | Callback bij datum selectie (date/time, events)  |
| `showTimePicker` | boolean  | `false`       | Toon tijd selectie onder kalender                |
| `timeFormat`     | string   | `'HH:mm'`     | Tijd formaat: 'HH:mm' of 'HH:mm:ss'              |
| `defaultTime`    | string   | `'12:00'`     | Standaard tijd wanneer geen tijd geselecteerd    |
| `timeStep`       | number   | `15`          | Minuten tussen tijd opties (5, 10, 15, 30)      |

### Event Data Structuur

De kalender accepteert flexibele event objecten. Alleen het `status` veld beïnvloedt styling:

```js
data: {
    '2023-12-25': [
        {
            label: 'Kerstmis',         // Weergave label (voor je app)
            status: 'active',          // 'active' of 'inactive' (beïnvloedt CSS)
            start: '09:00',            // Optioneel: start tijd
            end: '17:00'               // Optioneel: eind tijd
            // ... andere custom velden
        }
    ]
}
```

De kalender gebruikt `status` voor visuele indicatoren en event count badges.

***

## 🌐 Taal Ondersteuning

De kalender ondersteunt meerdere talen via externe taalbestanden.

### Ondersteunde Talen

- `en` - Engels
- `nl` - Nederlands (standaard)
- `fr` - Frans
- `de` - Duits

### Taalbestand Structuur

Taalbestanden definiëren vertalingen voor kalender elementen:

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

### Taalbestanden Laden

Laad taalbestanden voordat je de kalender initialiseert:

```html
<!-- Laad Nederlandse taal (standaard) -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/nl.js"></script>

<!-- Of laad Engels -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/lang/en.js"></script>

<!-- Dan laad kalender -->
<script src="public/goosse/Boostrap-5-Simple-Calendar/calendar.js"></script>
```

### Custom Taal

Je kunt ook custom talen direct definiëren:

```js
window.goosseCalendarLang = {
    custom: {
        today: 'Vandaag',
        noEvents: 'Geen events',
        weekdays: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
        dateFormat: 'DD-MM-YYYY',
        selectTime: 'Selecteer tijd:'
    }
};
```

Gebruik dan met `language: 'custom'`.

***

## 🚀 API Methodes

### ✅ `goosseCalendar.create(options)`

Creëert en rendert een kalender instantie.

```js
const calendar = goosseCalendar.create({
    target: '#calendar',
    // ... opties
});
```

Retourneert de kalender instantie (momenteel geen methodes blootgesteld).

***

## 🎨 Styling (`calendar.css`)

### Dag Statussen

```css
.goosse-calendar-day {
    /* Basis dag styling */
}

.goosse-calendar-day.today {
    /* Vandaag highlight */
}

.goosse-calendar-day.selected {
    /* Geselecteerde dag */
}

.goosse-calendar-day.has-data {
    /* Dagen met events */
}

.goosse-calendar-day.status-active {
    /* Actieve events */
}

.goosse-calendar-day.status-inactive {
    /* Niet-actieve events */
}
```

### Event Count Badge

```css
.goosse-calendar-count {
    /* Event count styling */
}
```

### Tijd Picker

```css
.goosse-time-picker {
    /* Tijd picker container */
}

.goosse-time-select {
    /* Individuele tijd select wrapper */
}

.goosse-time-part {
    /* Tijd select dropdowns */
}
```

***

## 🔒 Beveiliging & Toegankelijkheid

*   ✅ Bootstrap handelt base toegankelijkheid af
*   ✅ Geen inline `eval`
*   ✅ Alleen client-side (geen server beveiligingsimplicaties)
*   ✅ HTML escaping voor event titels

***

## ❌ Wat deze module bewust NIET doet

*   ❌ geen built‑in AJAX (maar werkt geweldig met fetch/XMLHttpRequest)
*   ❌ geen data persistentie
*   ❌ geen business logica
*   ❌ geen statische HTML
*   ❌ geen Tabler JS dependency

***

## ✅ Architecturale Beslissingen

*   **Tabler = CSS theme**
*   **Bootstrap = base styling**
*   **Goosse Calendar = herbruikbare UI module**
*   Event status beïnvloedt visuele styling
*   Taalbestanden voor i18n ondersteuning

***

## ✅ Samenvatting

*   ✅ Eenvoudige API met flexibele opties
*   ✅ Event data integratie
*   ✅ Multi-taal ondersteuning
*   ✅ Bootstrap-native styling
*   ✅ Tijd picker met customizable formaat
*   ✅ Kalender-only of tijd-only modi
*   ✅ AJAX data loading per maand
*   ✅ Production-ready</content>
<parameter name="filePath">C:\_web\_Server\www\npz\npz_gmvc\public\goosse\Boostrap-5-Simple-Calendar\README.nl.md
