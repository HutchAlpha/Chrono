// Gestionnaire de chronos
class TimerManager {
  constructor() {
    this.timers = []
    this.currentAlertTimer = null
    this.modal = document.getElementById("alertModal")
    this.alertMessage = document.getElementById("alertMessage")
    this.alarmInterval = null
    this.isAlarmPlaying = false

    this.initEventListeners()
    this.loadFromLocalStorage()
    this.renderTimers()
  }

  saveToLocalStorage() {
    const timersToSave = this.timers.map((timer) => ({
      id: timer.id,
      name: timer.name,
      initialTime: timer.initialTime,
      remainingTime: timer.remainingTime,
      status: timer.status === "running" ? "paused" : timer.status,
      overtimeSeconds: timer.overtimeSeconds,
      startedAt: timer.startedAt ? timer.startedAt.toISOString() : null,
    }))
    localStorage.setItem("timerManager_timers", JSON.stringify(timersToSave))
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem("timerManager_timers")
      if (saved) {
        const timersData = JSON.parse(saved)
        this.timers = timersData.map((data) => ({
          ...data,
          intervalId: null,
          startedAt: data.startedAt ? new Date(data.startedAt) : null,
        }))
      }
    } catch (e) {
      console.log("Erreur lors du chargement des données sauvegardées")
      this.timers = []
    }
  }

  initEventListeners() {
    document.getElementById("userForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTimer()
    })

    document.getElementById("timerPreset").addEventListener("change", (e) => {
      const customGroup = document.getElementById("customTimeGroup")
      customGroup.style.display = e.target.value === "custom" ? "block" : "none"
    })

    document.getElementById("confirmBtn").addEventListener("click", () => {
      this.closeAlert()
    })

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeAlert()
      }
    })
  }

  addTimer() {
    const nameInput = document.getElementById("userName")
    const presetSelect = document.getElementById("timerPreset")
    const customMinutes = document.getElementById("customMinutes")

    const name = nameInput.value.trim()
    if (!name) return

    let minutes
    if (presetSelect.value === "custom") {
      minutes = Number.parseInt(customMinutes.value) || 30
    } else {
      minutes = Number.parseInt(presetSelect.value)
    }

    const timer = {
      id: Date.now(),
      name: name,
      initialTime: minutes * 60,
      remainingTime: minutes * 60,
      status: "stopped",
      intervalId: null,
      overtimeSeconds: 0,
      startedAt: null,
    }

    this.timers.push(timer)
    this.saveToLocalStorage()
    this.renderTimers()

    nameInput.value = ""
    presetSelect.value = "30"
    customMinutes.value = ""
    document.getElementById("customTimeGroup").style.display = "none"

    this.startTimer(timer.id)
  }

  startTimer(id) {
    const timer = this.timers.find((t) => t.id === id)
    if (!timer) return

    if (timer.status === "overtime") return

    // Si le timer est en pause, on le reprend
    if (timer.status === "paused") {
      timer.status = "running"
    } else {
      timer.status = "running"
      timer.startedAt = timer.startedAt || new Date()
    }

    if (timer.intervalId) {
      clearInterval(timer.intervalId)
    }

    timer.intervalId = setInterval(() => {
      if (timer.remainingTime > 0) {
        timer.remainingTime--

        if (timer.remainingTime % 10 === 0) {
          this.saveToLocalStorage()
        }

        if (timer.remainingTime <= 60 && timer.remainingTime > 0) {
          this.updateTimerCard(timer, "warning")
        }

        this.updateTimerDisplay(timer)
      } else if (timer.status !== "overtime") {
        clearInterval(timer.intervalId)
        timer.status = "overtime"
        timer.overtimeSeconds = 0
        this.saveToLocalStorage()
        this.showAlert(timer)
        this.renderTimers()
      }
    }, 1000)

    this.renderTimers()
    this.saveToLocalStorage()
  }

  pauseTimer(id) {
    const timer = this.timers.find((t) => t.id === id)
    if (!timer || timer.status !== "running") return

    clearInterval(timer.intervalId)
    timer.status = "paused"
    this.renderTimers()
    this.saveToLocalStorage()
  }

  resetTimer(id) {
    const timer = this.timers.find((t) => t.id === id)
    if (!timer) return

    clearInterval(timer.intervalId)
    timer.remainingTime = timer.initialTime
    timer.status = "stopped"
    timer.overtimeSeconds = 0
    timer.startedAt = null

    if (this.currentAlertTimer === timer) {
      this.closeAlert()
    }

    this.renderTimers()
    this.saveToLocalStorage()
  }

  confirmTimer(id) {
    const timer = this.timers.find((t) => t.id === id)
    if (!timer) return

    clearInterval(timer.intervalId)

    if (this.currentAlertTimer === timer) {
      this.closeAlert()
    }

    this.deleteTimer(id)
  }

  deleteTimer(id) {
    const timer = this.timers.find((t) => t.id === id)
    if (timer) {
      clearInterval(timer.intervalId)
      if (this.currentAlertTimer === timer) {
        this.closeAlert()
      }
    }

    this.timers = this.timers.filter((t) => t.id !== id)
    this.renderTimers()
    this.saveToLocalStorage()
  }

  showAlert(timer) {
    this.currentAlertTimer = timer
    this.alertMessage.textContent = `Le temps de ${timer.name} est écoulé !`
    this.modal.classList.add("show")

    this.playAlarm()

    if (timer.intervalId) {
      clearInterval(timer.intervalId)
    }

    timer.intervalId = setInterval(() => {
      timer.overtimeSeconds++
      this.updateTimerDisplay(timer)
    }, 1000)
  }

  closeAlert() {
    this.modal.classList.remove("show")
    this.stopAlarm()
    this.currentAlertTimer = null
  }

  playAlarm() {
    if (this.isAlarmPlaying) return
    this.isAlarmPlaying = true

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      let beepCount = 0
      const maxBeeps = 5

      const playBeep = () => {
        if (beepCount >= maxBeeps || !this.isAlarmPlaying) {
          this.stopAlarm()
          return
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)

        beepCount++
      }

      playBeep()
      this.alarmInterval = setInterval(playBeep, 600)
    } catch (e) {
      console.log("Audio non supporté")
      this.isAlarmPlaying = false
    }
  }

  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval)
      this.alarmInterval = null
    }
    this.isAlarmPlaying = false
  }

  formatTime(seconds, isOvertime = false) {
    const absSeconds = Math.abs(seconds)
    const hours = Math.floor(absSeconds / 3600)
    const mins = Math.floor((absSeconds % 3600) / 60)
    const secs = absSeconds % 60

    const prefix = isOvertime ? "+" : ""

    if (hours > 0) {
      return `${prefix}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${prefix}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  updateTimerDisplay(timer) {
    const displayEl = document.querySelector(`[data-timer-id="${timer.id}"] .timer-display`)
    const overtimeLabel = document.querySelector(`[data-timer-id="${timer.id}"] .overtime-label`)

    if (displayEl) {
      if (timer.status === "overtime") {
        displayEl.textContent = this.formatTime(timer.overtimeSeconds, true)
        if (overtimeLabel) {
          overtimeLabel.textContent = `⚠️ DÉPASSEMENT: ${this.formatOvertimeText(timer.overtimeSeconds)}`
        }
      } else {
        displayEl.textContent = this.formatTime(timer.remainingTime)
      }
    }
  }

  formatOvertimeText(seconds) {
    if (seconds < 60) {
      return `${seconds} seconde${seconds > 1 ? "s" : ""}`
    } else {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins} min ${secs} sec`
    }
  }

  updateTimerCard(timer, additionalClass = "") {
    const card = document.querySelector(`[data-timer-id="${timer.id}"]`)
    if (!card) {
      this.renderTimers()
      return
    }

    card.className = "timer-card"
    if (timer.status === "running") card.classList.add("running")
    if (timer.status === "overtime") card.classList.add("overtime")
    if (additionalClass) card.classList.add(additionalClass)

    const badge = card.querySelector(".status-badge")
    if (badge) {
      badge.className = "status-badge " + timer.status
      badge.textContent = this.getStatusText(timer.status)
    }
  }

  getStatusText(status) {
    const texts = {
      stopped: "Arrêté",
      running: "En cours",
      paused: "En pause",
      overtime: "Dépassé",
    }
    return texts[status] || status
  }

  renderTimers() {
    const grid = document.getElementById("timersGrid")

    if (this.timers.length === 0) {
      grid.innerHTML = `
                <div class="empty-state">
                    <div class="icon">⏱️</div>
                    <p>Aucun chrono actif. Ajoutez un utilisateur pour commencer !</p>
                </div>
            `
      return
    }

    grid.innerHTML = this.timers
      .map(
        (timer) => `
            <div class="timer-card ${timer.status}" data-timer-id="${timer.id}">
                <div class="user-name">
                    <span>👤 ${this.escapeHtml(timer.name)}</span>
                    <button class="delete-btn" onclick="timerManager.deleteTimer(${timer.id})">×</button>
                </div>
                <span class="status-badge ${timer.status}">${this.getStatusText(timer.status)}</span>
                <div class="overtime-label">⚠️ DÉPASSEMENT: ${this.formatOvertimeText(timer.overtimeSeconds)}</div>
                <div class="timer-display">${timer.status === "overtime" ? this.formatTime(timer.overtimeSeconds, true) : this.formatTime(timer.remainingTime)}</div>
                <div class="timer-info">
                    <span>Durée initiale: ${this.formatTime(timer.initialTime)}</span>
                    ${timer.startedAt ? `<span>Démarré: ${timer.startedAt.toLocaleTimeString("fr-FR")}</span>` : ""}
                </div>
                <div class="timer-controls">
                    ${
                      timer.status === "paused"
                        ? `<button class="btn-start" onclick="timerManager.startTimer(${timer.id})">▶ Reprendre</button>`
                        : ""
                    }
                    ${
                      timer.status === "running"
                        ? `<button class="btn-pause" onclick="timerManager.pauseTimer(${timer.id})">⏸ Pause</button>`
                        : ""
                    }
                    <button class="btn-reset" onclick="timerManager.resetTimer(${timer.id})">↺ Reset</button>
                    <button class="btn-confirm-timer" onclick="timerManager.confirmTimer(${timer.id})">✓ Confirmer</button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

let timerManager
document.addEventListener("DOMContentLoaded", () => {
  timerManager = new TimerManager()
})
