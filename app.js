// --- 1. Service Worker für Offline-Fähigkeit registrieren ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registriert. App ist offline verfügbar!', reg.scope))
            .catch(err => console.error('Service Worker Fehler:', err));
    });
}

// --- 2. Tab Navigation ---
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    window.scrollTo(0,0);
}

// --- 3. Datenspeicherung (Texte) ---
const textareas = document.querySelectorAll('textarea');

window.onload = function() {
    // 3.1 Gespeicherte Texte beim Start laden
    textareas.forEach(ta => {
        const saved = localStorage.getItem(ta.id);
        if (saved) ta.value = saved;
        
        // Bei jedem Tastenanschlag sofort sicher im Handy speichern
        ta.addEventListener('input', function() {
            localStorage.setItem(this.id, this.value);
        });
    });

    // 3.2 Gespeicherte Bilder beim Start laden
    const imageKeys = ['data_so_bus', 'data_mo_kaz', 'data_di_pla', 'data_mi_ref', 'data_fr_high'];
    imageKeys.forEach(key => {
        const imgData = localStorage.getItem(key);
        if (imgData) {
            document.getElementById('preview_' + key).src = imgData;
            document.getElementById('container_' + key).style.display = 'inline-block';
        }
    });
};

// --- 4. Bilder komprimieren und speichern ---
function handleImage(inputElement, storageKey) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Bild verkleinern, damit der Handy-Browser-Speicher nicht voll wird
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

            try {
                localStorage.setItem(storageKey, dataUrl);
                document.getElementById('preview_' + storageKey).src = dataUrl;
                document.getElementById('container_' + storageKey).style.display = 'inline-block';
            } catch (error) {
                alert("Fehler beim Speichern: Speicherplatz auf dem Handy ist voll! Bitte lösche ein anderes Bild.");
            }
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

// --- 5. Bild wieder löschen ---
function deleteImage(storageKey, inputId) {
    if(confirm("Möchtest du dieses Foto wirklich löschen?")) {
        // Aus dem lokalen Speicher entfernen
        localStorage.removeItem(storageKey);
        
        // Von der Seite ausblenden
        document.getElementById('container_' + storageKey).style.display = 'none';
        document.getElementById('preview_' + storageKey).src = "";
        
        // Den internen Datei-Upload zurücksetzen
        document.getElementById(inputId).value = ""; 
    }
}

// --- 6. Alles löschen (am Ende der Reise) ---
function clearData() {
    if(confirm("ACHTUNG! Möchtest du wirklich ALLE Texte und Bilder unwiderruflich von deinem Handy löschen?")) {
        localStorage.clear();
        location.reload();
    }
}