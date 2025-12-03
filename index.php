<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronos Ecran</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Chronos Ecran</h1>
        </header>

        <div class="add-user-form">
            <h2>Ajouter un utilisateur</h2>
            <form id="userForm">
                <div class="form-group">
                    <label for="userName">Nom de l'utilisateur</label>
                    <input type="text" id="userName" placeholder="Entrez le nom" required>
                </div>
                <div class="form-group">
                    <label for="timerPreset">Durée du chrono</label>
                    <select id="timerPreset">
                        <option value="30">30 minutes</option>
                        <option value="60">1 heure</option>
                        <option value="90">1h30</option>
                        <option value="custom">Personnalisé</option>
                    </select>
                </div>
                <div class="form-group custom-time" id="customTimeGroup" style="display: none;">
                    <label for="customMinutes">Minutes personnalisées</label>
                    <input type="number" id="customMinutes" min="1" max="999" placeholder="Ex: 45">
                </div>
                <button type="submit" class="btn-add">➕ Ajouter</button>
            </form>
        </div>

        <div class="timers-grid" id="timersGrid">
            <!-- Les chronos seront ajoutés ici dynamiquement -->
        </div>
    </div>

    <!-- Modal d'alerte -->
    <div class="modal" id="alertModal">
        <div class="modal-content">
            <div class="modal-icon">🔔</div>
            <h2>Temps écoulé !</h2>
            <p id="alertMessage"></p>
            <button class="btn-confirm" id="confirmBtn">✓ Confirmer</button>
        </div>
    </div>

    <!-- Audio pour l'alarme -->
    <audio id="alarmSound" loop>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdXuJi4d3am14g4mIh3lwaXWAhoaFfXRxeH+EhYR9dnN3fIGEhIF7d3V5fYGDg4F8eHd5fIGCgoF8eXh5fH+BgoF9enl6e36BgYB+e3p6e36AgYCAf3t7e3t+f4CAf3x7fHt+f4B/fnx8fHx9f39/fnx8fXx9fn9/fn18fX19fn5/fn19fX19fn5+fn19fX19fn5+fn19fX19fn5+fn59fX19fX5+fn5+fX19fX1+fn5+fn19fX19fn5+fn5+fX19fX5+fn5+fn5+fX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+" type="audio/wav">
    </audio>

    <script src="script.js"></script>
</body>
</html>
