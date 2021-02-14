"use strict"

const saveUserSettings = () => localStorage.setItem("userSettings", JSON.stringify(window.userSettings))

// Load user settings
window.userSettings = localStorage.getItem("userSettings") ||
    {
        useGPU: false,
        customWindowSize:`${window.innerHeight},${window.innerWidth}`,
        autoplay: false,
        autoPlayGen: false,
        audio: {
            format: "wav"
        }
    }
if ((typeof window.userSettings)=="string") {
    window.userSettings = JSON.parse(window.userSettings)
}
if (!window.userSettings.audio) { // For backwards compatibility
    window.userSettings.audio = {format: "wav", hz: 22050, padStart: 0, padEnd: 0}
}
if (!window.userSettings.sliderTooltip) { // For backwards compatibility
    window.userSettings.sliderTooltip = true
}
if (!window.userSettings.audio.hz) { // For backwards compatibility
    window.userSettings.audio.hz = 22050
}
if (!window.userSettings.audio.padStart) { // For backwards compatibility
    window.userSettings.audio.padStart = 0
}
if (!window.userSettings.audio.padEnd) { // For backwards compatibility
    window.userSettings.audio.padEnd = 0
}
if (!window.userSettings.audio.ffmpeg) { // For backwards compatibility
    window.userSettings.audio.ffmpeg = false
}
if (!window.userSettings.audio.bitdepth) { // For backwards compatibility
    window.userSettings.audio.bitdepth = "pcm_s32le"
}
if (!window.userSettings.vocoder) { // For backwards compatibility
    window.userSettings.vocoder = "256_waveglow"
}
if (!window.userSettings.audio.amplitude) { // For backwards compatibility
    window.userSettings.audio.amplitude = 1
}



useGPUCbx.checked = window.userSettings.useGPU
autoplay_ckbx.checked = window.userSettings.autoplay
setting_slidersTooltip.checked = window.userSettings.sliderTooltip
setting_autoplaygenCbx.checked = window.userSettings.autoPlayGen
setting_audio_ffmpeg.checked = window.userSettings.audio.ffmpeg
setting_audio_format.value = window.userSettings.audio.format
setting_audio_hz.value = window.userSettings.audio.hz
setting_audio_pad_start.value = window.userSettings.audio.padStart
setting_audio_pad_end.value = window.userSettings.audio.padEnd
setting_audio_bitdepth.value = window.userSettings.audio.bitdepth
setting_audio_amplitude.value = window.userSettings.audio.amplitude

const [height, width] = window.userSettings.customWindowSize.split(",").map(v => parseInt(v))
ipcRenderer.send("resize", {height, width})

saveUserSettings()



// Settings Menu
// =============
useGPUCbx.addEventListener("change", () => {
    spinnerModal("Changing device...")
    fetch(`http://localhost:8008/setDevice`, {
        method: "Post",
        body: JSON.stringify({device: useGPUCbx.checked ? "gpu" : "cpu"})
    }).then(r=>r.text()).then(res => {
        window.closeModal()
        window.userSettings.useGPU = useGPUCbx.checked
        saveUserSettings()
    }).catch(e => {
        console.log(e)
        if (e.code =="ENOENT") {
            window.closeModal().then(() => {
                createModal("error", "There was a problem")
            })
        }
    })
})
setting_autoplaygenCbx.addEventListener("click", () => {
    window.userSettings.autoPlayGen = setting_autoplaygenCbx.checked
    saveUserSettings()
})
setting_slidersTooltip.addEventListener("click", () => {
    window.userSettings.sliderTooltip = setting_slidersTooltip.checked
    saveUserSettings()
})

setting_audio_ffmpeg.addEventListener("click", () => {
    window.userSettings.audio.ffmpeg = setting_audio_ffmpeg.checked
    setting_audio_format.disabled = !window.userSettings.audio.ffmpeg
    setting_audio_hz.disabled = !window.userSettings.audio.ffmpeg
    setting_audio_pad_start.disabled = !window.userSettings.audio.ffmpeg
    setting_audio_pad_end.disabled = !window.userSettings.audio.ffmpeg
    setting_audio_bitdepth.disabled = !window.userSettings.audio.ffmpeg
    saveUserSettings()
})
setting_audio_format.disabled = !window.userSettings.audio.ffmpeg
setting_audio_format.addEventListener("change", () => {
    window.userSettings.audio.format = setting_audio_format.value
    saveUserSettings()
})
setting_audio_hz.disabled = !window.userSettings.audio.ffmpeg
setting_audio_hz.addEventListener("change", () => {
    window.userSettings.audio.hz = setting_audio_hz.value
    saveUserSettings()
})
setting_audio_pad_start.disabled = !window.userSettings.audio.ffmpeg
setting_audio_pad_start.addEventListener("change", () => {
    window.userSettings.audio.padStart = parseInt(setting_audio_pad_start.value)
    saveUserSettings()
})
setting_audio_pad_end.disabled = !window.userSettings.audio.ffmpeg
setting_audio_pad_end.addEventListener("change", () => {
    window.userSettings.audio.padEnd = parseInt(setting_audio_pad_end.value)
    saveUserSettings()
})
setting_audio_bitdepth.disabled = !window.userSettings.audio.ffmpeg
setting_audio_bitdepth.addEventListener("change", () => {
    window.userSettings.audio.bitdepth = setting_audio_bitdepth.value
    saveUserSettings()
})
setting_audio_amplitude.disabled = !window.userSettings.audio.ffmpeg
setting_audio_amplitude.addEventListener("change", () => {
    window.userSettings.audio.amplitude = setting_audio_amplitude.value
    saveUserSettings()
})

// Populate the game directories
fs.readdir(`${path}/models`, (err, gameDirs) => {
    gameDirs.filter(name => !name.includes(".")).forEach(gameFolder => {
        // Initialize the default output directory setting for this game
        if (!Object.keys(window.userSettings).includes(`outpath_${gameFolder}`)) {
            window.userSettings[`outpath_${gameFolder}`] = `${__dirname.replace(/\\/g,"/")}/output/${gameFolder}`.replace(/\/\//g, "/").replace("resources/app/resources/app", "resources/app")
            saveUserSettings()
        }
        // Create and populate the settings menu entry for this
        const outPathElem = createElem("input", {value: window.userSettings[`outpath_${gameFolder}`]})
        outPathElem.addEventListener("change", () => {
            outPathElem.value = outPathElem.value.replace(/\/\//g, "/").replace(/\\/g,"/")
            window.userSettings[`outpath_${gameFolder}`] = outPathElem.value
            saveUserSettings()
            if (window.currentModelButton) {
                window.currentModelButton.click()
            }
        })
        const gameName = fs.readdirSync(`${path}/assets`).find(f => f.startsWith(gameFolder)).split("-").reverse()[0].split(".")[0]
        settingsOptionsContainer.appendChild(createElem("div", [createElem("div", `${gameName} output folder`), createElem("div", outPathElem)]))
    })
})


exports.saveUserSettings = saveUserSettings