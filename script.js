/* =========================================================
   SAFE YOUR LIFE
   SYL - JAVASCRIPT COMPLETO
   + ABLY
   + USUÁRIOS ONLINE EM TEMPO REAL
   + PERFIL ADMINISTRATIVO ALEX
   + ALERTA DE PROXIMIDADE DE 100 METROS
   + ÁUDIO WEB
   + VIBRAÇÃO
   + SINCRONIZAÇÃO REAL-TIME DE PRESENÇA
========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÕES DO SISTEMA
========================================================= */

const SYL_ABLY_KEY =
    "zfqwdA.QY0KxQ:_RQcTI6NCeRMNnLLyC8Ebb6Lg50xnDlcwvRv4wQ3H5o";

const SYL_ABLY_CHANNEL =
    "syl-map-live";

const SYL_ADMIN_NAME =
    "Alex";

const SYL_PROXIMITY_RADIUS_METERS =
    100;

const SYL_PROXIMITY_ALERT_COOLDOWN =
    1500;


/* =========================================================
   ESTADO DA APLICAÇÃO
========================================================= */

let currentUser = "";

let screenTransitionLocked = false;

let firstLoadingAnimation = null;

let secondLoadingAnimation = null;

let settingsTimer = null;

let sylMap = null;

let userMapMarker = null;

let mapLoadingAnimation = null;


/* =========================================================
   ESTADO ABLY
========================================================= */

let ablyRealtime = null;

let ablyMapChannel = null;

let ablyMapClientId = null;

let ablyPresenceStarted = false;

let ablyPresenceSubscribed = false;


/*
 * Controle da sincronização da Presence.
 */
let ablyPresenceSyncTimer = null;

let ablyConnectionHandler = null;

let ablyPresenceGeneration = 0;


/* =========================================================
   ESTADO DE LOCALIZAÇÃO
========================================================= */

let globalLocationWatchId = null;

let mapLocationWatchId = null;

let mapLastPosition = null;


/* =========================================================
   USUÁRIOS ONLINE
========================================================= */

let sylOnlineUsers = {};


/* =========================================================
   CONTROLE DE PROXIMIDADE
========================================================= */

let sylProximityPairs = {};


/* =========================================================
   ÁUDIO
========================================================= */

let sylAudioContext = null;


/* =========================================================
   ESTADO DO MENU ADMIN
========================================================= */

let sylAdminMenuOpen = false;


/* =========================================================
   CONFIGURAÇÕES PADRÃO
========================================================= */

const defaultSettings = {

    markerColor:
        "#00b894",

    notificationMode:
        "audio-vibrate"

};


/* =========================================================
   ELEMENTOS - TELAS
========================================================= */

let loginScreen;

let loadingScreen;

let environmentScreen;

let moduleLoadingScreen;

let centralScreen;


/* =========================================================
   ELEMENTOS - LOGIN
========================================================= */

let userNameInput;

let loginButton;


/* =========================================================
   ELEMENTOS - PRIMEIRO CARREGAMENTO
========================================================= */

let loadingGreeting;

let loadingStatus;

let loadingPercent;

let loadingProgress;


/* =========================================================
   ELEMENTOS - AMBIENTE
========================================================= */

let environmentUserName;

let accessPlatformButton;

let environmentClock;


/* =========================================================
   ELEMENTOS - SEGUNDO CARREGAMENTO
========================================================= */

let moduleLoadingStatus;

let moduleLoadingPercent;

let moduleLoadingProgress;


/* =========================================================
   ELEMENTOS - CENTRAL
========================================================= */

let centralClock;

let settingsButton;

let disconnectButton;


/* =========================================================
   ELEMENTOS - MODAL DESENVOLVIMENTO
========================================================= */

let developmentModal;

let developmentOverlay;

let developmentCloseButton;

let developmentOkButton;


/* =========================================================
   ELEMENTOS - AJUSTES
========================================================= */

let settingsModal;

let settingsOverlay;

let settingsCloseButton;

let settingsCancelButton;

let applySettingsButton;

let settingsApplying;

let settingsSuccess;

let settingsApplyProgressBar;

let markerColor;

let markerColorPreview;

let markerColorValue;


/* =========================================================
   ELEMENTOS - MAPA
========================================================= */

let mapLoadingScreen;

let mapScreen;

let mapLoadingProgress;

let mapLoadingPercent;

let mapLoadingStatus;

let mapUserName;

let mapLocationStatus;

let mapLocationLoading;

let closeMapButton;

let mapClock;


/* =========================================================
   MARCADORES REMOTOS
========================================================= */

const remoteMapMarkers = {};


/* =========================================================
   CARREGA ELEMENTOS DO DOM
========================================================= */

function cacheDomElements() {

    loginScreen =
        document.getElementById("loginScreen");

    loadingScreen =
        document.getElementById("loadingScreen");

    environmentScreen =
        document.getElementById("environmentScreen");

    moduleLoadingScreen =
        document.getElementById("moduleLoadingScreen");

    centralScreen =
        document.getElementById("centralScreen");

    userNameInput =
        document.getElementById("userName");

    loginButton =
        document.getElementById("loginButton");

    loadingGreeting =
        document.getElementById("loadingGreeting");

    loadingStatus =
        document.getElementById("loadingStatus");

    loadingPercent =
        document.getElementById("loadingPercent");

    loadingProgress =
        document.getElementById("loadingProgress");

    environmentUserName =
        document.getElementById("environmentUserName");

    accessPlatformButton =
        document.getElementById("accessPlatformButton");

    environmentClock =
        document.getElementById("environmentClock");

    moduleLoadingStatus =
        document.getElementById("moduleLoadingStatus");

    moduleLoadingPercent =
        document.getElementById("moduleLoadingPercent");

    moduleLoadingProgress =
        document.getElementById("moduleLoadingProgress");

    centralClock =
        document.getElementById("centralClock");

    settingsButton =
        document.getElementById("settingsButton");

    disconnectButton =
        document.getElementById("disconnectButton");

    developmentModal =
        document.getElementById("developmentModal");

    developmentOverlay =
        document.querySelector(".development-overlay");

    developmentCloseButton =
        document.getElementById("developmentCloseButton");

    developmentOkButton =
        document.getElementById("developmentOkButton");

    settingsModal =
        document.getElementById("settingsModal");

    settingsOverlay =
        document.querySelector(".settings-overlay");

    settingsCloseButton =
        document.getElementById("settingsCloseButton");

    settingsCancelButton =
        document.getElementById("settingsCancelButton");

    applySettingsButton =
        document.getElementById("applySettingsButton");

    settingsApplying =
        document.getElementById("settingsApplying");

    settingsSuccess =
        document.getElementById("settingsSuccess");

    settingsApplyProgressBar =
        document.getElementById("settingsApplyProgressBar");

    markerColor =
        document.getElementById("markerColor");

    markerColorPreview =
        document.getElementById("markerColorPreview");

    markerColorValue =
        document.getElementById("markerColorValue");

    mapLoadingScreen =
        document.getElementById("mapLoadingScreen");

    mapScreen =
        document.getElementById("mapScreen");

    mapLoadingProgress =
        document.getElementById("mapLoadingProgress");

    mapLoadingPercent =
        document.getElementById("mapLoadingPercent");

    mapLoadingStatus =
        document.getElementById("mapLoadingStatus");

    mapUserName =
        document.getElementById("mapUserName");

    mapLocationStatus =
        document.getElementById("mapLocationStatus");

    mapLocationLoading =
        document.getElementById("mapLocationLoading");

    closeMapButton =
        document.getElementById("closeMapButton");

    mapClock =
        document.getElementById("mapClock");

}


/* =========================================================
   FUNÇÃO AUXILIAR
========================================================= */

function elementExists(element) {

    return (
        element !== null &&
        element !== undefined
    );

}


/* =========================================================
   TROCA DE TELA
========================================================= */

function showScreen(targetScreen) {

    if (!elementExists(targetScreen)) {
        return;
    }

    if (screenTransitionLocked) {
        return;
    }

    screenTransitionLocked = true;

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(function(screen) {

        screen.classList.remove("active");

    });

    requestAnimationFrame(function() {

        requestAnimationFrame(function() {

            targetScreen.classList.add("active");

        });

    });

    setTimeout(function() {

        screenTransitionLocked = false;

    }, 850);

}


/* =========================================================
   VERIFICA ADMIN
========================================================= */

function isSylAdmin() {

    return (
        String(currentUser)
            .trim()
            .toLowerCase() ===
        SYL_ADMIN_NAME.toLowerCase()
    );

}


/* =========================================================
   LOGIN
========================================================= */

function performLogin() {

    console.log(
        "[SYL] Tentativa de login."
    );

    if (!elementExists(userNameInput)) {

        console.error(
            "[SYL] Campo userName não encontrado."
        );

        return;

    }

    const name =
        userNameInput.value.trim();

    if (!name) {

        userNameInput.focus();

        userNameInput.classList.add(
            "input-error"
        );

        setTimeout(function() {

            userNameInput.classList.remove(
                "input-error"
            );

        }, 600);

        return;

    }

    currentUser = name;

    console.log(
        "[SYL] Usuário conectado:",
        currentUser
    );

    if (elementExists(loadingGreeting)) {

        loadingGreeting.textContent =
            "Olá, " + currentUser + "!";

    }

    if (elementExists(environmentUserName)) {

        environmentUserName.textContent =
            currentUser;

    }

    if (elementExists(mapUserName)) {

        mapUserName.textContent =
            currentUser;

    }

    initializeProximityAudio();

    if (
        sylAudioContext &&
        sylAudioContext.state === "suspended"
    ) {

        sylAudioContext.resume()
            .catch(function(error) {

                console.warn(
                    "[SYL] Não foi possível ativar áudio:",
                    error
                );

            });

    }

    startAblyPresence();

    startGlobalLocationTracking();

    startFirstLoading();

}


/* =========================================================
   PRIMEIRO CARREGAMENTO
========================================================= */

const firstLoadingMessages = [

    {
        progress: 0,
        text: "Inicializando plataforma..."
    },

    {
        progress: 15,
        text: "Preparando ambiente seguro..."
    },

    {
        progress: 30,
        text: "Verificando conexão..."
    },

    {
        progress: 48,
        text: "Carregando recursos..."
    },

    {
        progress: 67,
        text: "Configurando sua experiência..."
    },

    {
        progress: 84,
        text: "Sincronizando plataforma..."
    },

    {
        progress: 95,
        text: "Quase tudo pronto..."
    },

    {
        progress: 100,
        text: "Tudo pronto!"
    }

];


function startFirstLoading() {

    if (firstLoadingAnimation) {

        cancelAnimationFrame(
            firstLoadingAnimation
        );

    }

    showScreen(loadingScreen);

    if (elementExists(loadingProgress)) {
        loadingProgress.style.width = "0%";
    }

    if (elementExists(loadingPercent)) {
        loadingPercent.textContent = "0%";
    }

    if (elementExists(loadingStatus)) {
        loadingStatus.textContent =
            "Inicializando plataforma...";
    }

    const duration = 4200;

    const startTime =
        performance.now();

    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const rawProgress =
            Math.min(
                elapsed / duration,
                1
            );

        const progress =
            1 -
            Math.pow(
                1 - rawProgress,
                2.2
            );

        const percent =
            Math.round(
                progress * 100
            );

        if (elementExists(loadingProgress)) {

            loadingProgress.style.width =
                percent + "%";

        }

        if (elementExists(loadingPercent)) {

            loadingPercent.textContent =
                percent + "%";

        }

        let message =
            firstLoadingMessages[0].text;

        firstLoadingMessages.forEach(function(item) {

            if (percent >= item.progress) {
                message = item.text;
            }

        });

        if (elementExists(loadingStatus)) {

            loadingStatus.textContent =
                message;

        }

        if (rawProgress < 1) {

            firstLoadingAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            if (elementExists(loadingProgress)) {
                loadingProgress.style.width = "100%";
            }

            if (elementExists(loadingPercent)) {
                loadingPercent.textContent = "100%";
            }

            if (elementExists(loadingStatus)) {
                loadingStatus.textContent = "Tudo pronto!";
            }

            setTimeout(function() {

                showScreen(environmentScreen);

            }, 500);

        }

    }

    firstLoadingAnimation =
        requestAnimationFrame(
            animate
        );

}


/* =========================================================
   SEGUNDO CARREGAMENTO
========================================================= */

const secondLoadingMessages = [

    {
        progress: 0,
        text: "Inicializando..."
    },

    {
        progress: 20,
        text: "Carregando módulos..."
    },

    {
        progress: 42,
        text: "Preparando mapa..."
    },

    {
        progress: 65,
        text: "Configurando ambiente..."
    },

    {
        progress: 88,
        text: "Finalizando módulo..."
    },

    {
        progress: 100,
        text: "Módulo iniciado!"
    }

];


function startModule() {

    if (!elementExists(moduleLoadingScreen)) {
        return;
    }

    if (secondLoadingAnimation) {

        cancelAnimationFrame(
            secondLoadingAnimation
        );

    }

    showScreen(moduleLoadingScreen);

    if (elementExists(moduleLoadingProgress)) {
        moduleLoadingProgress.style.width = "0%";
    }

    if (elementExists(moduleLoadingPercent)) {
        moduleLoadingPercent.textContent = "0%";
    }

    if (elementExists(moduleLoadingStatus)) {
        moduleLoadingStatus.textContent =
            "Inicializando...";
    }

    const duration = 3600;

    const startTime =
        performance.now();

    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const rawProgress =
            Math.min(
                elapsed / duration,
                1
            );

        const progress =
            1 -
            Math.pow(
                1 - rawProgress,
                2
            );

        const percent =
            Math.round(
                progress * 100
            );

        if (elementExists(moduleLoadingProgress)) {

            moduleLoadingProgress.style.width =
                percent + "%";

        }

        if (elementExists(moduleLoadingPercent)) {

            moduleLoadingPercent.textContent =
                percent + "%";

        }

        let message =
            secondLoadingMessages[0].text;

        secondLoadingMessages.forEach(function(item) {

            if (percent >= item.progress) {
                message = item.text;
            }

        });

        if (elementExists(moduleLoadingStatus)) {

            moduleLoadingStatus.textContent =
                message;

        }

        if (rawProgress < 1) {

            secondLoadingAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            if (elementExists(moduleLoadingProgress)) {
                moduleLoadingProgress.style.width = "100%";
            }

            if (elementExists(moduleLoadingPercent)) {
                moduleLoadingPercent.textContent = "100%";
            }

            if (elementExists(moduleLoadingStatus)) {
                moduleLoadingStatus.textContent =
                    "Módulo iniciado!";
            }

            setTimeout(function() {

                showScreen(centralScreen);

            }, 600);

        }

    }

    secondLoadingAnimation =
        requestAnimationFrame(
            animate
        );

}


/* =========================================================
   SITE OFICIAL
========================================================= */

function openDevelopmentModal() {

    if (!elementExists(developmentModal)) {
        return;
    }

    developmentModal.classList.add("active");

    developmentModal.setAttribute(
        "aria-hidden",
        "false"
    );

    if (elementExists(developmentOkButton)) {

        setTimeout(function() {

            developmentOkButton.focus();

        }, 150);

    }

}


function closeDevelopmentModal() {

    if (!elementExists(developmentModal)) {
        return;
    }

    developmentModal.classList.remove("active");

    developmentModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   AJUSTES
========================================================= */

function getSavedSettings() {

    try {

        const saved =
            localStorage.getItem(
                "sylSettings"
            );

        if (!saved) {

            return {
                ...defaultSettings
            };

        }

        const parsed =
            JSON.parse(saved);

        return {
            ...defaultSettings,
            ...parsed
        };

    } catch (error) {

        console.warn(
            "Erro ao carregar configurações:",
            error
        );

        return {
            ...defaultSettings
        };

    }

}


function saveSettings(settings) {

    try {

        localStorage.setItem(
            "sylSettings",
            JSON.stringify(settings)
        );

        return true;

    } catch (error) {

        console.error(
            "Erro ao salvar configurações:",
            error
        );

        return false;

    }

}


/* =========================================================
   ATUALIZA PREVIEW
========================================================= */

function updateMarkerColorPreview() {

    if (
        !elementExists(markerColor) ||
        !elementExists(markerColorPreview) ||
        !elementExists(markerColorValue)
    ) {
        return;
    }

    const color =
        markerColor.value;

    markerColorPreview.style.background =
        color;

    markerColorPreview.style.boxShadow =
        "0 0 28px " + color;

    markerColorValue.textContent =
        color.toUpperCase();

}


/* =========================================================
   CARREGA CONFIGURAÇÕES
========================================================= */

function loadSettingsIntoForm() {

    const settings =
        getSavedSettings();

    if (elementExists(markerColor)) {

        markerColor.value =
            settings.markerColor;

    }

    const selectedRadio =
        document.querySelector(
            'input[name="notificationMode"][value="' +
            settings.notificationMode +
            '"]'
        );

    if (selectedRadio) {
        selectedRadio.checked = true;
    }

    updateMarkerColorPreview();

}


/* =========================================================
   RESET MODAL
========================================================= */

function resetSettingsOverlay() {

    if (settingsTimer) {

        clearTimeout(settingsTimer);

        settingsTimer = null;

    }

    if (elementExists(settingsApplying)) {

        settingsApplying.classList.remove("active");

    }

    if (elementExists(settingsSuccess)) {

        settingsSuccess.classList.remove("active");

    }

    if (elementExists(settingsApplyProgressBar)) {

        settingsApplyProgressBar.style.width = "0%";

    }

}


/* =========================================================
   ABRIR AJUSTES
========================================================= */

function openSettingsModal() {

    if (!elementExists(settingsModal)) {
        return;
    }

    loadSettingsIntoForm();

    resetSettingsOverlay();

    settingsModal.classList.add("active");

    settingsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    if (elementExists(markerColor)) {

        setTimeout(function() {

            markerColor.focus();

        }, 150);

    }

}


/* =========================================================
   FECHAR AJUSTES
========================================================= */

function closeSettingsModal() {

    if (!elementExists(settingsModal)) {
        return;
    }

    resetSettingsOverlay();

    settingsModal.classList.remove("active");

    settingsModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   COR DO MARCADOR
========================================================= */

function getMarkerColor() {

    let color =
        defaultSettings.markerColor;

    try {

        const saved =
            localStorage.getItem(
                "sylSettings"
            );

        if (saved) {

            const settings =
                JSON.parse(saved);

            if (
                settings &&
                typeof settings.markerColor === "string"
            ) {

                color =
                    settings.markerColor;

            }

        }

    } catch (error) {

        console.warn(
            "Erro ao carregar cor do marcador:",
            error
        );

    }

    return color;

}


/* =========================================================
   ATUALIZA APARÊNCIA DO MARCADOR
========================================================= */

function updateLocalMarkerAppearance() {

    if (!userMapMarker || !sylMap) {
        return;
    }

    if (typeof L === "undefined") {
        return;
    }

    const color =
        getMarkerColor();

    const markerIcon =
        L.divIcon({

            className:
                "syl-user-marker-container",

            html:
                '<div class="syl-user-marker" ' +
                'style="--syl-marker-color:' +
                escapeHtml(color) +
                ';"></div>',

            iconSize: [20, 20],

            iconAnchor: [10, 10],

            popupAnchor: [0, -10]

        });

    userMapMarker.setIcon(markerIcon);

}


/* =========================================================
   PUBLICA CONFIGURAÇÕES
========================================================= */

function publishCurrentMapSettings() {

    if (
        !ablyMapChannel ||
        !ablyPresenceStarted
    ) {
        return;
    }

    const settings =
        getSavedSettings();

    const data = {

        type:
            "settings",

        name:
            currentUser,

        markerColor:
            settings.markerColor,

        notificationMode:
            settings.notificationMode,

        latitude:
            mapLastPosition
                ? mapLastPosition.latitude
                : null,

        longitude:
            mapLastPosition
                ? mapLastPosition.longitude
                : null,

        accuracy:
            mapLastPosition
                ? mapLastPosition.accuracy
                : null,

        updatedAt:
            Date.now()

    };

    try {

        ablyMapChannel.presence.update(
            data,
            function(error) {

                if (error) {

                    console.warn(
                        "[SYL] Erro ao publicar configurações:",
                        error
                    );

                }

            }
        );

    } catch (error) {

        console.warn(
            "[SYL] Não foi possível atualizar configurações:",
            error
        );

    }

}


/* =========================================================
   APLICAR AJUSTES
========================================================= */

function applySettings() {

    if (!elementExists(markerColor)) {
        return;
    }

    const selectedNotification =
        document.querySelector(
            'input[name="notificationMode"]:checked'
        );

    const newSettings = {

        markerColor:
            markerColor.value,

        notificationMode:
            selectedNotification
                ? selectedNotification.value
                : defaultSettings.notificationMode

    };

    saveSettings(newSettings);

    updateLocalMarkerAppearance();

    publishCurrentMapSettings();

    if (elementExists(settingsApplying)) {
        settingsApplying.classList.add("active");
    }

    if (elementExists(settingsApplyProgressBar)) {

        settingsApplyProgressBar.style.width = "0%";

        setTimeout(function() {

            settingsApplyProgressBar.style.width =
                "100%";

        }, 80);

    }

    settingsTimer =
        setTimeout(function() {

            if (elementExists(settingsApplying)) {
                settingsApplying.classList.remove("active");
            }

            if (elementExists(settingsSuccess)) {
                settingsSuccess.classList.add("active");
            }

            settingsTimer =
                setTimeout(function() {

                    closeSettingsModal();

                }, 1500);

        }, 1750);

}


/* =========================================================
   MAPA
========================================================= */

const mapLoadingMessages = [

    {
        progress: 0,
        text: "Inicializando mapa..."
    },

    {
        progress: 18,
        text: "Preparando ambiente seguro..."
    },

    {
        progress: 36,
        text: "Carregando recursos cartográficos..."
    },

    {
        progress: 54,
        text: "Preparando localização..."
    },

    {
        progress: 72,
        text: "Configurando sistema operacional..."
    },

    {
        progress: 88,
        text: "Finalizando mapa..."
    },

    {
        progress: 100,
        text: "Sistema operacional!"
    }

];


function startMapModule() {

    if (
        !elementExists(mapLoadingScreen) ||
        !elementExists(mapScreen)
    ) {

        console.error(
            "Elementos do mapa não encontrados."
        );

        return;

    }

    closeSettingsModal();

    closeDevelopmentModal();

    if (elementExists(mapUserName)) {

        mapUserName.textContent =
            currentUser || "Usuário";

    }

    mapScreen.classList.remove("active");

    mapLoadingScreen.classList.add("active");

    if (elementExists(mapLoadingProgress)) {
        mapLoadingProgress.style.width = "0%";
    }

    if (elementExists(mapLoadingPercent)) {
        mapLoadingPercent.textContent = "0%";
    }

    if (elementExists(mapLoadingStatus)) {
        mapLoadingStatus.textContent =
            "Inicializando mapa...";
    }

    if (elementExists(mapLocationLoading)) {

        mapLocationLoading.style.display =
            "flex";

    }

    runMapLoadingAnimation();

}


function runMapLoadingAnimation() {

    if (mapLoadingAnimation) {

        cancelAnimationFrame(
            mapLoadingAnimation
        );

    }

    const duration = 4200;

    const startTime =
        performance.now();

    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const rawProgress =
            Math.min(
                elapsed / duration,
                1
            );

        const progress =
            1 -
            Math.pow(
                1 - rawProgress,
                2.4
            );

        const percent =
            Math.round(
                progress * 100
            );

        if (elementExists(mapLoadingProgress)) {
            mapLoadingProgress.style.width =
                percent + "%";
        }

        if (elementExists(mapLoadingPercent)) {
            mapLoadingPercent.textContent =
                percent + "%";
        }

        let message =
            mapLoadingMessages[0].text;

        mapLoadingMessages.forEach(function(item) {

            if (percent >= item.progress) {
                message = item.text;
            }

        });

        if (elementExists(mapLoadingStatus)) {
            mapLoadingStatus.textContent =
                message;
        }

        if (rawProgress < 1) {

            mapLoadingAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            if (elementExists(mapLoadingProgress)) {
                mapLoadingProgress.style.width =
                    "100%";
            }

            if (elementExists(mapLoadingPercent)) {
                mapLoadingPercent.textContent =
                    "100%";
            }

            if (elementExists(mapLoadingStatus)) {
                mapLoadingStatus.textContent =
                    "Sistema operacional!";
            }

            setTimeout(function() {

                openOperationalMap();

            }, 650);

        }

    }

    mapLoadingAnimation =
        requestAnimationFrame(
            animate
        );

}


function openOperationalMap() {

    if (elementExists(mapLoadingScreen)) {

        mapLoadingScreen.classList.remove(
            "active"
        );

    }

    setTimeout(function() {

        if (elementExists(mapScreen)) {

            mapScreen.classList.add("active");

        }

        setTimeout(function() {

            initializeSylMap();

            injectSylAdminUI();

            /*
             * Sincroniza imediatamente ao abrir o mapa.
             */
            syncAblyPresence();

        }, 150);

    }, 350);

}


/* =========================================================
   INICIALIZA LEAFLET
========================================================= */

function initializeSylMap() {

    if (typeof L === "undefined") {

        console.error(
            "Leaflet não foi carregado."
        );

        if (elementExists(mapLocationStatus)) {

            mapLocationStatus.textContent =
                "Biblioteca do mapa indisponível.";

        }

        hideMapLocationLoading();

        return;

    }

    if (sylMap) {

        sylMap.invalidateSize();

        requestUserLocation();

        renderAllRemoteMapMarkers();

        injectSylAdminUI();

        return;

    }

    const initialLatitude =
        -23.5505;

    const initialLongitude =
        -46.6333;

    sylMap =
        L.map(
            "sylMap",
            {
                zoomControl: true,
                attributionControl: true
            }
        )
        .setView(
            [
                initialLatitude,
                initialLongitude
            ],
            13
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    )
    .addTo(sylMap);

    requestUserLocation();

    renderAllRemoteMapMarkers();

    injectSylAdminUI();

}


/* =========================================================
   GEOLOCALIZAÇÃO
========================================================= */

function requestUserLocation() {

    if (!navigator.geolocation) {

        if (elementExists(mapLocationStatus)) {

            mapLocationStatus.textContent =
                "Geolocalização não suportada.";

        }

        hideMapLocationLoading();

        return;

    }

    if (elementExists(mapLocationStatus)) {

        mapLocationStatus.textContent =
            "Obtendo localização atual...";

    }

    if (elementExists(mapLocationLoading)) {

        mapLocationLoading.style.display =
            "flex";

    }

    if (mapLocationWatchId !== null) {

        navigator.geolocation.clearWatch(
            mapLocationWatchId
        );

        mapLocationWatchId = null;

    }

    mapLocationWatchId =
        navigator.geolocation.watchPosition(

            function(position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;

                mapLastPosition = {

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    accuracy:
                        accuracy,

                    timestamp:
                        Date.now()

                };

                showUserLocation(
                    latitude,
                    longitude,
                    accuracy
                );

                publishMapPosition(
                    latitude,
                    longitude,
                    accuracy
                );

                checkAllProximities();

                renderSylAdminUserList();

            },

            function(error) {

                console.warn(
                    "Erro de geolocalização:",
                    error
                );

                hideMapLocationLoading();

                if (elementExists(mapLocationStatus)) {

                    if (
                        error.code ===
                        error.PERMISSION_DENIED
                    ) {

                        mapLocationStatus.textContent =
                            "Permissão de localização negada.";

                    } else if (
                        error.code ===
                        error.POSITION_UNAVAILABLE
                    ) {

                        mapLocationStatus.textContent =
                            "Localização indisponível.";

                    } else if (
                        error.code ===
                        error.TIMEOUT
                    ) {

                        mapLocationStatus.textContent =
                            "Tempo limite excedido.";

                    } else {

                        mapLocationStatus.textContent =
                            "Não foi possível localizar.";

                    }

                }

            },

            {

                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0

            }

        );

}


/* =========================================================
   MOSTRA USUÁRIO NO MAPA
========================================================= */

function showUserLocation(
    latitude,
    longitude,
    accuracy
) {

    if (!sylMap) {
        return;
    }

    const color =
        getMarkerColor();

    const markerIcon =
        L.divIcon({

            className:
                "syl-user-marker-container",

            html:
                '<div class="syl-user-marker" ' +
                'style="--syl-marker-color:' +
                escapeHtml(color) +
                ';"></div>',

            iconSize: [20, 20],

            iconAnchor: [10, 10],

            popupAnchor: [0, -10]

        });

    if (userMapMarker) {

        userMapMarker.setLatLng([
            latitude,
            longitude
        ]);

        userMapMarker.setIcon(markerIcon);

    } else {

        userMapMarker =
            L.marker(
                [
                    latitude,
                    longitude
                ],
                {
                    icon: markerIcon
                }
            )
            .addTo(sylMap);

    }

    sylMap.setView(
        [
            latitude,
            longitude
        ],
        17,
        {
            animate: true,
            duration: 1.2
        }
    );

    const accuracyMeters =
        Math.round(accuracy);

    if (elementExists(mapLocationStatus)) {

        mapLocationStatus.textContent =
            "Localização encontrada • precisão ±" +
            accuracyMeters +
            " m";

    }

    hideMapLocationLoading();

    userMapMarker.bindPopup(
        "<strong>Você está aqui</strong><br>" +
        "Posição atual do usuário."
    );

}


function hideMapLocationLoading() {

    if (!elementExists(mapLocationLoading)) {
        return;
    }

    mapLocationLoading.style.display =
        "none";

}


/* =========================================================
   ABLY - CLIENT ID
========================================================= */

function createMapClientId() {

    const normalizedName =
        String(
            currentUser || "usuario"
        )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9_-]/gi,
            "-"
        );

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 10);

    return (
        "syl-" +
        normalizedName +
        "-" +
        randomPart
    );

}


/* =========================================================
   ÁUDIO DE PROXIMIDADE
========================================================= */

function initializeProximityAudio() {

    if (sylAudioContext) {
        return;
    }

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            console.warn(
                "[SYL] Web Audio API não disponível."
            );

            return;

        }

        sylAudioContext =
            new AudioContext();

    } catch (error) {

        console.warn(
            "[SYL] Áudio Web indisponível:",
            error
        );

    }

}


/* =========================================================
   SOM DE PROXIMIDADE
========================================================= */

function playProximitySound() {

    if (!sylAudioContext) {

        initializeProximityAudio();

    }

    if (!sylAudioContext) {
        return;
    }

    try {

        if (
            sylAudioContext.state ===
            "suspended"
        ) {

            sylAudioContext.resume()
                .catch(function() {});

        }

        const now =
            sylAudioContext.currentTime;

        const frequencies = [
            880,
            1174,
            880
        ];

        frequencies.forEach(function(
            frequency,
            index
        ) {

            const oscillator =
                sylAudioContext.createOscillator();

            const gain =
                sylAudioContext.createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.value =
                frequency;

            const start =
                now +
                index * 0.16;

            const end =
                start +
                0.12;

            gain.gain.setValueAtTime(
                0.0001,
                start
            );

            gain.gain.exponentialRampToValueAtTime(
                0.18,
                start + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                end
            );

            oscillator.connect(gain);

            gain.connect(
                sylAudioContext.destination
            );

            oscillator.start(start);

            oscillator.stop(
                end + 0.02
            );

        });

    } catch (error) {

        console.warn(
            "[SYL] Erro no alerta sonoro:",
            error
        );

    }

}


/* =========================================================
   ALERTA DE PROXIMIDADE
========================================================= */

function playProximityAlert(
    user,
    distance
) {

    const settings =
        getSavedSettings();

    const mode =
        settings.notificationMode;

    if (
        mode === "audio" ||
        mode === "audio-vibrate"
    ) {

        playProximitySound();

    }

    if (
        mode === "vibrate" ||
        mode === "audio-vibrate"
    ) {

        if (
            navigator.vibrate
        ) {

            navigator.vibrate([
                180,
                100,
                180,
                100,
                260
            ]);

        }

    }

    console.log(
        "[SYL] ALERTA DE PROXIMIDADE:",
        user
            ? user.name
            : "Usuário",
        Math.round(distance) +
        " metros"
    );

}


/* =========================================================
   DISTÂNCIA - HAVERSINE
========================================================= */

function getDistanceMeters(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {

    const earthRadius =
        6371000;

    const lat1 =
        latitude1 *
        Math.PI /
        180;

    const lat2 =
        latitude2 *
        Math.PI /
        180;

    const deltaLat =
        (
            latitude2 -
            latitude1
        ) *
        Math.PI /
        180;

    const deltaLon =
        (
            longitude2 -
            longitude1
        ) *
        Math.PI /
        180;

    const a =
        Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return (
        earthRadius *
        c
    );

}


/* =========================================================
   CHAVE DO PAR
========================================================= */

function createProximityPairKey(
    clientIdA,
    clientIdB
) {

    return [
        String(clientIdA),
        String(clientIdB)
    ]
    .sort()
    .join("::");

}


/* =========================================================
   VERIFICA PROXIMIDADE
========================================================= */

function checkProximityToUser(
    clientId
) {

    if (
        !mapLastPosition ||
        !clientId
    ) {

        return;

    }

    if (
        clientId ===
        ablyMapClientId
    ) {

        return;

    }

    const user =
        sylOnlineUsers[clientId];

    if (!user) {
        return;
    }

    if (
        typeof user.latitude !== "number" ||
        typeof user.longitude !== "number"
    ) {

        return;

    }

    const distance =
        getDistanceMeters(

            mapLastPosition.latitude,

            mapLastPosition.longitude,

            user.latitude,

            user.longitude

        );

    const pairKey =
        createProximityPairKey(
            ablyMapClientId,
            clientId
        );

    const isInside =
        distance <=
        SYL_PROXIMITY_RADIUS_METERS;

    const previousState =
        sylProximityPairs[pairKey] || {

            inside: false,

            lastAlertAt: 0

        };


    if (isInside) {

        const now =
            Date.now();

        const justEntered =
            previousState.inside !== true;

        const cooldownExpired =
            now -
            previousState.lastAlertAt >=
            SYL_PROXIMITY_ALERT_COOLDOWN;

        if (
            justEntered &&
            cooldownExpired
        ) {

            playProximityAlert(
                user,
                distance
            );

            previousState.lastAlertAt =
                now;

        }

        previousState.inside =
            true;

        sylProximityPairs[pairKey] =
            previousState;

        console.log(
            "[SYL] Usuário próximo:",
            user.name,
            Math.round(distance) +
            " m"
        );

    } else {

        previousState.inside =
            false;

        sylProximityPairs[pairKey] =
            previousState;

    }

}


/* =========================================================
   VERIFICA TODAS AS PROXIMIDADES
========================================================= */

function checkAllProximities() {

    if (!mapLastPosition) {
        return;
    }

    Object.keys(
        sylOnlineUsers
    )
    .forEach(function(clientId) {

        checkProximityToUser(
            clientId
        );

    });

}


/* =========================================================
   ABLY - NORMALIZA DADOS DO USUÁRIO
========================================================= */

function normalizeAblyMemberData(member) {

    if (!member) {
        return {};
    }

    let data =
        member.data;

    if (
        typeof data === "string"
    ) {

        try {

            data =
                JSON.parse(data);

        } catch (error) {

            console.warn(
                "[SYL] Dados de presença inválidos:",
                member.clientId
            );

            data = {};

        }

    }

    if (
        !data ||
        typeof data !== "object"
    ) {

        data = {};

    }

    return data;

}


/* =========================================================
   ABLY - ATUALIZA USUÁRIO ONLINE
========================================================= */

function updateOnlineUser(member) {

    if (!member) {
        return;
    }

    const clientId =
        String(
            member.clientId || ""
        ).trim();

    if (!clientId) {
        return;
    }

    const data =
        normalizeAblyMemberData(member);

    const previous =
        sylOnlineUsers[clientId] || {};

    sylOnlineUsers[clientId] = {

        clientId:
            clientId,

        name:
            data.name ||
            previous.name ||
            clientId,

        markerColor:
            data.markerColor ||
            previous.markerColor ||
            defaultSettings.markerColor,

        notificationMode:
            data.notificationMode ||
            previous.notificationMode ||
            defaultSettings.notificationMode,

        latitude:
            typeof data.latitude === "number"
                ? data.latitude
                : previous.latitude,

        longitude:
            typeof data.longitude === "number"
                ? data.longitude
                : previous.longitude,

        accuracy:
            typeof data.accuracy === "number"
                ? data.accuracy
                : previous.accuracy,

        updatedAt:
            typeof data.updatedAt === "number"
                ? data.updatedAt
                : Date.now()

    };

    /*
     * Atualização imediata da interface.
     */
    renderAllRemoteMapMarkers();

    renderSylAdminUserList();

    checkProximityToUser(
        clientId
    );

    checkAllProximities();

}


/* =========================================================
   SINCRONIZAÇÃO AUTORITATIVA DA PRESENÇA ABLY
========================================================= */

function syncAblyPresence() {

    if (
        !ablyMapChannel ||
        !ablyPresenceSubscribed
    ) {

        return;

    }

    const generation =
        ablyPresenceGeneration;

    try {

        ablyMapChannel.presence.get(
            function(error, members) {

                /*
                 * Ignora resposta antiga de uma conexão
                 * anterior.
                 */
                if (
                    generation !==
                    ablyPresenceGeneration
                ) {

                    return;

                }

                if (error) {

                    console.warn(
                        "[SYL] Falha na sincronização da Presence:",
                        error
                    );

                    return;

                }

                if (!Array.isArray(members)) {

                    console.warn(
                        "[SYL] Presence retornou dados inválidos."
                    );

                    return;

                }

                const onlineIds = {};

                members.forEach(function(member) {

                    if (!member || !member.clientId) {
                        return;
                    }

                    const clientId =
                        String(
                            member.clientId
                        ).trim();

                    if (!clientId) {
                        return;
                    }

                    onlineIds[clientId] =
                        true;

                    updateOnlineUser(member);

                });


                /*
                 * Remove da memória local qualquer usuário
                 * que não esteja mais na Presence oficial.
                 */
                Object.keys(
                    sylOnlineUsers
                )
                .forEach(function(clientId) {

                    if (
                        !onlineIds[clientId]
                    ) {

                        removeOnlineUser(
                            clientId
                        );

                    }

                });


                renderAllRemoteMapMarkers();

                renderSylAdminUserList();

                checkAllProximities();

                console.log(
                    "[SYL] Presence sincronizada:",
                    members.length,
                    "usuário(s) online."
                );

            }
        );

    } catch (error) {

        console.warn(
            "[SYL] Erro durante sincronização da Presence:",
            error
        );

    }

}


/* =========================================================
   SINCRONIZAÇÃO PERIÓDICA
========================================================= */

function startAblyPresenceSyncTimer() {

    stopAblyPresenceSyncTimer();

    ablyPresenceSyncTimer =
        setInterval(
            function() {

                if (
                    !currentUser ||
                    !ablyMapChannel ||
                    !ablyPresenceSubscribed
                ) {

                    return;

                }

                syncAblyPresence();

            },
            3000
        );

}


function stopAblyPresenceSyncTimer() {

    if (
        ablyPresenceSyncTimer !== null
    ) {

        clearInterval(
            ablyPresenceSyncTimer
        );

        ablyPresenceSyncTimer =
            null;

    }

}


/* =========================================================
   REMOVE USUÁRIO
========================================================= */

function removeOnlineUser(
    clientId
) {

    if (!clientId) {
        return;
    }

    const normalizedClientId =
        String(clientId).trim();

    const removedUser =
        sylOnlineUsers[
            normalizedClientId
        ];

    delete sylOnlineUsers[
        normalizedClientId
    ];


    Object.keys(
        sylProximityPairs
    )
    .forEach(function(key) {

        if (
            key.indexOf(
                normalizedClientId
            ) !== -1
        ) {

            delete sylProximityPairs[key];

        }

    });


    removeRemoteMarker(
        normalizedClientId
    );

    renderAllRemoteMapMarkers();

    renderSylAdminUserList();


    if (removedUser) {

        console.log(
            "[SYL] Usuário removido da lista:",
            removedUser.name,
            normalizedClientId
        );

    }

}


/* =========================================================
   MARCADORES REMOTOS
========================================================= */

function createRemoteMarker(user) {

    if (
        !sylMap ||
        !user ||
        typeof user.latitude !== "number" ||
        typeof user.longitude !== "number"
    ) {

        return;

    }

    if (
        user.clientId ===
        ablyMapClientId
    ) {

        return;

    }

    const color =
        user.markerColor ||
        defaultSettings.markerColor;

    const icon =
        L.divIcon({

            className:
                "syl-user-marker-container",

            html:
                '<div class="syl-user-marker" ' +
                'style="--syl-marker-color:' +
                escapeHtml(color) +
                ';"></div>',

            iconSize: [20, 20],

            iconAnchor: [10, 10],

            popupAnchor: [0, -10]

        });

    if (
        remoteMapMarkers[user.clientId]
    ) {

        remoteMapMarkers[user.clientId]
            .setLatLng([
                user.latitude,
                user.longitude
            ]);

        remoteMapMarkers[user.clientId]
            .setIcon(icon);

        remoteMapMarkers[user.clientId]
            .setPopupContent(
                "<strong>" +
                escapeHtml(user.name) +
                "</strong><br>" +
                "Usuário online"
            );

        return;

    }

    const marker =
        L.marker(
            [
                user.latitude,
                user.longitude
            ],
            {
                icon: icon
            }
        )
        .addTo(sylMap);

    marker.bindPopup(
        "<strong>" +
        escapeHtml(user.name) +
        "</strong><br>" +
        "Usuário online"
    );

    remoteMapMarkers[user.clientId] =
        marker;

}


/* =========================================================
   ESCAPA HTML
========================================================= */

function escapeHtml(value) {

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   REMOVE MARCADOR
========================================================= */

function removeRemoteMarker(
    clientId
) {

    const marker =
        remoteMapMarkers[clientId];

    if (
        marker &&
        sylMap
    ) {

        try {

            sylMap.removeLayer(
                marker
            );

        } catch (error) {

            console.warn(
                "[SYL] Erro ao remover marcador remoto:",
                error
            );

        }

    }

    delete remoteMapMarkers[
        clientId
    ];

}


/* =========================================================
   RENDERIZA MARCADORES
========================================================= */

function renderAllRemoteMapMarkers() {

    if (!sylMap) {
        return;
    }

    const activeMarkerIds = {};

    Object.keys(
        sylOnlineUsers
    )
    .forEach(function(clientId) {

        const user =
            sylOnlineUsers[clientId];

        if (
            user &&
            typeof user.latitude === "number" &&
            typeof user.longitude === "number"
        ) {

            activeMarkerIds[clientId] =
                true;

            createRemoteMarker(user);

        }

    });


    /*
     * Remove marcadores que já não possuem
     * um usuário correspondente.
     */
    Object.keys(
        remoteMapMarkers
    )
    .forEach(function(clientId) {

        if (
            !activeMarkerIds[clientId]
        ) {

            removeRemoteMarker(
                clientId
            );

        }

    });

}


/* =========================================================
   PUBLICA POSIÇÃO
========================================================= */

function publishMapPosition(
    latitude,
    longitude,
    accuracy
) {

    if (
        !ablyMapChannel ||
        !ablyPresenceStarted
    ) {

        return;

    }

    const settings =
        getSavedSettings();

    const data = {

        type:
            "location",

        name:
            currentUser,

        latitude:
            latitude,

        longitude:
            longitude,

        accuracy:
            accuracy,

        markerColor:
            settings.markerColor,

        notificationMode:
            settings.notificationMode,

        updatedAt:
            Date.now()

    };

    try {

        ablyMapChannel.presence.update(
            data,
            function(error) {

                if (error) {

                    console.warn(
                        "[SYL] Falha ao publicar localização:",
                        error
                    );

                }

            }
        );

    } catch (error) {

        console.warn(
            "[SYL] Falha ao publicar localização:",
            error
        );

    }

}


/* =========================================================
   INICIA ABLY
========================================================= */

function startAblyPresence() {

    if (!currentUser) {
        return;
    }

    if (
        ablyRealtime &&
        ablyMapChannel
    ) {

        if (
            ablyPresenceStarted
        ) {

            publishCurrentMapSettings();

        } else if (
            ablyPresenceSubscribed
        ) {

            enterAblyPresence();

        }

        syncAblyPresence();

        return;

    }

    if (typeof Ably === "undefined") {

        console.error(
            "[SYL] Biblioteca Ably não encontrada."
        );

        return;

    }


    /*
     * Nova geração de conexão.
     */
    ablyPresenceGeneration++;


    if (!ablyMapClientId) {

        ablyMapClientId =
            createMapClientId();

    }


    try {

        ablyRealtime =
            new Ably.Realtime({

                key:
                    SYL_ABLY_KEY,

                clientId:
                    ablyMapClientId

            });


        ablyMapChannel =
            ablyRealtime.channels.get(
                SYL_ABLY_CHANNEL
            );


        ablyConnectionHandler =
            function(stateChange) {

                console.log(
                    "[SYL] Ably:",
                    stateChange.current
                );


                /*
                 * Quando a conexão volta,
                 * reconstrói a presença.
                 */
                if (
                    stateChange.current ===
                    "connected"
                ) {

                    setTimeout(
                        function() {

                            if (
                                !ablyRealtime ||
                                !ablyMapChannel
                            ) {

                                return;

                            }

                            if (
                                !ablyPresenceStarted
                            ) {

                                enterAblyPresence();

                            }

                            syncAblyPresence();

                        },
                        300
                    );

                }

            };


        ablyRealtime.connection.on(
            ablyConnectionHandler
        );


        ablyMapChannel.attach(
            function(error) {

                if (error) {

                    console.error(
                        "[SYL] Erro ao conectar ao canal Ably:",
                        error
                    );

                    return;

                }

                console.log(
                    "[SYL] Canal Ably conectado:",
                    SYL_ABLY_CHANNEL
                );

                subscribeAblyPresence();

            }
        );

    } catch (error) {

        console.error(
            "[SYL] Não foi possível iniciar Ably:",
            error
        );

    }

}


/* =========================================================
   ASSINA PRESENÇA
========================================================= */

function subscribeAblyPresence() {

    if (!ablyMapChannel) {
        return;
    }


    /*
     * Evita múltiplas inscrições.
     */
    if (
        ablyPresenceSubscribed
    ) {

        if (
            !ablyPresenceStarted
        ) {

            enterAblyPresence();

        }

        syncAblyPresence();

        startAblyPresenceSyncTimer();

        return;

    }


    try {

        ablyMapChannel.presence.subscribe(
            function(member) {

                if (!member) {
                    return;
                }

                const action =
                    String(
                        member.action || ""
                    ).toLowerCase();

                const clientId =
                    member.clientId;


                console.log(
                    "[SYL] Presença:",
                    action,
                    clientId
                );


                /*
                 * Usuário saiu.
                 */
                if (
                    action === "leave" ||
                    action === "absent"
                ) {

                    removeOnlineUser(
                        clientId
                    );


                    /*
                     * Confirma o estado real do canal
                     * depois do evento.
                     */
                    setTimeout(
                        function() {

                            syncAblyPresence();

                        },
                        250
                    );

                    return;

                }


                /*
                 * enter
                 * update
                 * present
                 * e demais eventos válidos.
                 */
                updateOnlineUser(
                    member
                );


                /*
                 * Atualização adicional da lista.
                 */
                renderSylAdminUserList();

            }
        );


        ablyPresenceSubscribed =
            true;


        /*
         * Primeiro sincroniza a lista oficial.
         */
        syncAblyPresence();


        /*
         * Depois entra na Presence.
         */
        if (
            !ablyPresenceStarted
        ) {

            enterAblyPresence();

        }


        /*
         * Inicia reconciliação periódica.
         */
        startAblyPresenceSyncTimer();

    } catch (error) {

        console.error(
            "[SYL] Erro na presença Ably:",
            error
        );

    }

}


/* =========================================================
   ENTRA NA PRESENÇA
========================================================= */

function enterAblyPresence() {

    if (
        !ablyMapChannel ||
        !currentUser
    ) {

        return;

    }


    if (
        ablyPresenceStarted
    ) {

        publishCurrentMapSettings();

        syncAblyPresence();

        return;

    }


    const settings =
        getSavedSettings();

    const data = {

        type:
            "online",

        name:
            currentUser,

        markerColor:
            settings.markerColor,

        notificationMode:
            settings.notificationMode,

        latitude:
            mapLastPosition
                ? mapLastPosition.latitude
                : null,

        longitude:
            mapLastPosition
                ? mapLastPosition.longitude
                : null,

        accuracy:
            mapLastPosition
                ? mapLastPosition.accuracy
                : null,

        updatedAt:
            Date.now()

    };


    try {

        ablyMapChannel.presence.enter(
            data,
            function(error) {

                if (error) {

                    console.error(
                        "[SYL] Erro ao entrar na presença:",
                        error
                    );

                    return;

                }


                ablyPresenceStarted =
                    true;


                console.log(
                    "[SYL] Usuário presente no canal:",
                    currentUser,
                    "| clientId:",
                    ablyMapClientId
                );


                publishCurrentMapSettings();


                /*
                 * Atualiza imediatamente a lista.
                 */
                syncAblyPresence();

            }
        );

    } catch (error) {

        console.error(
            "[SYL] Erro ao entrar no canal:",
            error
        );

    }

}


/* =========================================================
   RASTREAMENTO GLOBAL
========================================================= */

function startGlobalLocationTracking() {

    if (!navigator.geolocation) {
        return;
    }

    if (
        globalLocationWatchId !== null
    ) {

        return;

    }

    globalLocationWatchId =
        navigator.geolocation.watchPosition(

            function(position) {

                mapLastPosition = {

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    accuracy:
                        position.coords.accuracy,

                    timestamp:
                        Date.now()

                };


                publishMapPosition(
                    mapLastPosition.latitude,
                    mapLastPosition.longitude,
                    mapLastPosition.accuracy
                );


                checkAllProximities();

                renderSylAdminUserList();

            },

            function(error) {

                console.warn(
                    "[SYL] Localização global:",
                    error
                );

            },

            {

                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    3000

            }

        );

}


function stopGlobalLocationTracking() {

    if (
        globalLocationWatchId !== null
    ) {

        navigator.geolocation.clearWatch(
            globalLocationWatchId
        );

        globalLocationWatchId =
            null;

    }

}


/* =========================================================
   ADMINISTRADOR
========================================================= */

function injectSylAdminUI() {

    if (!isSylAdmin()) {

        removeSylAdminUI();

        return;

    }


    if (
        document.getElementById(
            "sylAdminButton"
        )
    ) {

        renderSylAdminUserList();

        return;

    }


    const style =
        document.createElement("style");

    style.id =
        "syl-admin-runtime-style";

    style.textContent = `

        #sylAdminButton {

            position: absolute;
            top: 78px;
            right: 18px;
            z-index: 1000;

            display: flex;
            align-items: center;
            gap: 8px;

            border: 1px solid rgba(0,184,148,.45);

            background: rgba(7,22,35,.92);

            color: #fff;

            border-radius: 12px;

            padding: 11px 15px;

            font-size: 13px;

            font-weight: 700;

            cursor: pointer;

            box-shadow:
                0 8px 24px rgba(0,0,0,.25);

            backdrop-filter: blur(12px);

            transition: .25s ease;

        }

        #sylAdminButton:hover {

            transform:
                translateY(-2px);

            border-color:
                rgba(0,184,148,.9);

        }

        #sylAdminPanel {

            position: absolute;

            top: 126px;
            right: 18px;

            width:
                min(340px, calc(100% - 36px));

            max-height: 430px;

            z-index: 1001;

            display: none;

            overflow: hidden;

            flex-direction: column;

            background:
                rgba(7,22,35,.96);

            border:
                1px solid rgba(0,184,148,.35);

            border-radius: 16px;

            color: #fff;

            box-shadow:
                0 18px 50px rgba(0,0,0,.35);

            backdrop-filter:
                blur(18px);

        }

        #sylAdminPanel.active {

            display: flex;

        }

        .syl-admin-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 16px;

            border-bottom:
                1px solid rgba(255,255,255,.08);

        }

        .syl-admin-title {

            font-size: 14px;

            font-weight: 800;

        }

        .syl-admin-count {

            min-width: 26px;

            height: 26px;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background: #00b894;

            color: #fff;

            font-size: 12px;

            font-weight: 800;

        }

        .syl-admin-list {

            overflow: auto;

            padding: 8px;

        }

        .syl-admin-user {

            display: flex;

            align-items: center;

            gap: 10px;

            padding: 11px;

            border-radius: 12px;

            margin-bottom: 5px;

            background:
                rgba(255,255,255,.04);

        }

        .syl-admin-user:hover {

            background:
                rgba(255,255,255,.08);

        }

        .syl-admin-user-dot {

            width: 11px;

            height: 11px;

            min-width: 11px;

            border-radius: 50%;

            box-shadow:
                0 0 10px currentColor;

        }

        .syl-admin-user-info {

            min-width: 0;

            flex: 1;

        }

        .syl-admin-user-name {

            font-size: 13px;

            font-weight: 700;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

        }

        .syl-admin-user-status {

            margin-top: 3px;

            font-size: 11px;

            opacity: .65;

        }

        .syl-admin-footer {

            padding: 10px 14px;

            font-size: 10px;

            opacity: .55;

            border-top:
                1px solid rgba(255,255,255,.08);

        }

    `;

    document.head.appendChild(style);


    if (!mapScreen) {
        return;
    }


    const adminButton =
        document.createElement("button");

    adminButton.id =
        "sylAdminButton";

    adminButton.type =
        "button";

    adminButton.innerHTML =
        '<i class="fa fa-users"></i>' +
        '<span>Usuários online</span>';


    adminButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            toggleSylAdminPanel();

        }
    );


    const adminPanel =
        document.createElement("div");

    adminPanel.id =
        "sylAdminPanel";


    adminPanel.innerHTML = `

        <div class="syl-admin-header">

            <div class="syl-admin-title">
                Usuários conectados
            </div>

            <div
                class="syl-admin-count"
                id="sylAdminCount"
            >
                0
            </div>

        </div>

        <div
            class="syl-admin-list"
            id="sylAdminList"
        ></div>

        <div class="syl-admin-footer">
            Atualização em tempo real via SYL
        </div>

    `;


    mapScreen.appendChild(
        adminButton
    );

    mapScreen.appendChild(
        adminPanel
    );


    renderSylAdminUserList();

}


/* =========================================================
   MENU ADMIN
========================================================= */

function toggleSylAdminPanel() {

    const panel =
        document.getElementById(
            "sylAdminPanel"
        );

    if (!panel) {
        return;
    }

    sylAdminMenuOpen =
        !sylAdminMenuOpen;

    if (sylAdminMenuOpen) {

        panel.classList.add("active");

        /*
         * Atualiza a lista no momento em que Alex abre.
         */
        syncAblyPresence();

        renderSylAdminUserList();

    } else {

        panel.classList.remove("active");

    }

}


/* =========================================================
   REMOVE ADMIN UI
========================================================= */

function removeSylAdminUI() {

    const button =
        document.getElementById(
            "sylAdminButton"
        );

    const panel =
        document.getElementById(
            "sylAdminPanel"
        );

    const style =
        document.getElementById(
            "syl-admin-runtime-style"
        );

    if (button) {
        button.remove();
    }

    if (panel) {
        panel.remove();
    }

    if (style) {
        style.remove();
    }

    sylAdminMenuOpen = false;

}


/* =========================================================
   LISTA ADMINISTRATIVA
========================================================= */

function renderSylAdminUserList() {

    if (!isSylAdmin()) {
        return;
    }

    const list =
        document.getElementById(
            "sylAdminList"
        );

    const count =
        document.getElementById(
            "sylAdminCount"
        );

    if (!list) {
        return;
    }


    const users =
        Object.keys(
            sylOnlineUsers
        )
        .map(function(clientId) {

            return sylOnlineUsers[
                clientId
            ];

        })
        .filter(function(user) {

            return (
                user &&
                user.clientId
            );

        })
        .sort(function(a, b) {

            return String(a.name)
                .localeCompare(
                    String(b.name)
                );

        });


    if (count) {

        count.textContent =
            users.length;

    }


    if (!users.length) {

        list.innerHTML = `

            <div class="syl-admin-user">

                <div
                    class="syl-admin-user-dot"
                    style="
                        color:#777;
                        background:#777;
                    "
                ></div>

                <div class="syl-admin-user-info">

                    <div class="syl-admin-user-name">
                        Nenhum usuário encontrado
                    </div>

                    <div class="syl-admin-user-status">
                        Aguardando conexões...
                    </div>

                </div>

            </div>

        `;

        return;

    }


    list.innerHTML = "";


    users.forEach(function(user) {

        const item =
            document.createElement("div");

        item.className =
            "syl-admin-user";


        const dot =
            document.createElement("div");

        dot.className =
            "syl-admin-user-dot";


        const color =
            user.markerColor ||
            defaultSettings.markerColor;


        dot.style.background =
            color;

        dot.style.color =
            color;


        const info =
            document.createElement("div");

        info.className =
            "syl-admin-user-info";


        const name =
            document.createElement("div");

        name.className =
            "syl-admin-user-name";

        name.textContent =
            String(user.name || user.clientId) +
            (
                user.clientId ===
                ablyMapClientId
                    ? " (você)"
                    : ""
            );


        const status =
            document.createElement("div");

        status.className =
            "syl-admin-user-status";


        if (
            typeof user.latitude === "number" &&
            typeof user.longitude === "number"
        ) {

            status.textContent =
                "Online • localização disponível";

        } else {

            status.textContent =
                "Online • localização aguardando";

        }


        info.appendChild(name);

        info.appendChild(status);

        item.appendChild(dot);

        item.appendChild(info);

        list.appendChild(item);

    });

}


/* =========================================================
   FECHA ADMIN AO CLICAR FORA
========================================================= */

function setupAdminOutsideClick() {

    document.addEventListener(
        "click",
        function(event) {

            const panel =
                document.getElementById(
                    "sylAdminPanel"
                );

            const button =
                document.getElementById(
                    "sylAdminButton"
                );

            if (!panel || !button) {
                return;
            }

            if (
                !panel.contains(event.target) &&
                !button.contains(event.target)
            ) {

                panel.classList.remove(
                    "active"
                );

                sylAdminMenuOpen =
                    false;

            }

        }
    );

}


/* =========================================================
   FECHA MAPA
========================================================= */

function closeOperationalMap() {

    if (mapLoadingAnimation) {

        cancelAnimationFrame(
            mapLoadingAnimation
        );

        mapLoadingAnimation =
            null;

    }

    if (
        mapLocationWatchId !== null
    ) {

        navigator.geolocation.clearWatch(
            mapLocationWatchId
        );

        mapLocationWatchId =
            null;

    }

    if (mapScreen) {

        mapScreen.classList.remove(
            "active"
        );

    }

    if (mapLoadingScreen) {

        mapLoadingScreen.classList.remove(
            "active"
        );

    }

    sylAdminMenuOpen =
        false;

    const adminPanel =
        document.getElementById(
            "sylAdminPanel"
        );

    if (adminPanel) {

        adminPanel.classList.remove(
            "active"
        );

    }

    setTimeout(function() {

        showScreen(centralScreen);

    }, 400);

}


/* =========================================================
   SAI DA PRESENÇA ABLY
========================================================= */

function leaveAblyPresence() {

    if (
        !ablyMapChannel ||
        !ablyPresenceStarted
    ) {

        return;

    }

    try {

        ablyMapChannel.presence.leave(
            function(error) {

                if (error) {

                    console.warn(
                        "[SYL] Erro ao sair da presença:",
                        error
                    );

                } else {

                    console.log(
                        "[SYL] Usuário saiu da Presence:",
                        currentUser
                    );

                }

            }
        );

    } catch (error) {

        console.warn(
            "[SYL] Erro ao sair do Ably:",
            error
        );

    }

    ablyPresenceStarted =
        false;

}


/* =========================================================
   ENCERRA ABLY
========================================================= */

function disconnectAbly() {

    /*
     * Impede callbacks antigos de alterarem
     * o novo estado.
     */
    ablyPresenceGeneration++;

    stopAblyPresenceSyncTimer();

    leaveAblyPresence();


    if (
        ablyRealtime &&
        ablyConnectionHandler
    ) {

        try {

            ablyRealtime.connection.off(
                ablyConnectionHandler
            );

        } catch (error) {

            console.warn(
                "[SYL] Erro ao remover listener Ably:",
                error
            );

        }

    }


    if (ablyMapChannel) {

        try {

            ablyMapChannel.detach();

        } catch (error) {

            console.warn(
                "[SYL] Erro ao desligar canal:",
                error
            );

        }

    }


    if (ablyRealtime) {

        try {

            ablyRealtime.close();

        } catch (error) {

            console.warn(
                "[SYL] Erro ao fechar Ably:",
                error
            );

        }

    }


    ablyRealtime =
        null;

    ablyMapChannel =
        null;

    ablyMapClientId =
        null;

    ablyPresenceStarted =
        false;

    ablyPresenceSubscribed =
        false;

    ablyConnectionHandler =
        null;

}


/* =========================================================
   DESCONEXÃO
========================================================= */

function disconnect() {

    console.log(
        "[SYL] Desconectando:",
        currentUser
    );


    stopGlobalLocationTracking();

    disconnectAbly();


    currentUser =
        "";


    sylOnlineUsers =
        {};

    sylProximityPairs =
        {};

    mapLastPosition =
        null;


    closeDevelopmentModal();

    closeSettingsModal();

    closeOperationalMap();

    removeSylAdminUI();


    if (userMapMarker && sylMap) {

        try {

            sylMap.removeLayer(
                userMapMarker
            );

        } catch (error) {

            console.warn(
                "[SYL] Erro ao remover marcador:",
                error
            );

        }

    }


    userMapMarker =
        null;


    Object.keys(
        remoteMapMarkers
    )
    .forEach(function(clientId) {

        removeRemoteMarker(
            clientId
        );

    });


    if (elementExists(userNameInput)) {

        userNameInput.value =
            "";

    }


    setTimeout(function() {

        showScreen(loginScreen);

    }, 450);

}


/* =========================================================
   RELÓGIO
========================================================= */

function getCurrentTime() {

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    return (
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );

}


function updateClocks() {

    const time =
        getCurrentTime();

    if (elementExists(environmentClock)) {

        environmentClock.textContent =
            time;

    }

    if (elementExists(centralClock)) {

        centralClock.textContent =
            time;

    }

    if (elementExists(mapClock)) {

        mapClock.textContent =
            time;

    }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initializeSylApplication() {

    console.log(
        "[SYL] Inicializando aplicação..."
    );


    cacheDomElements();

    updateClocks();

    updateMarkerColorPreview();


    /* =====================================================
       LOGIN
    ===================================================== */

    if (elementExists(loginButton)) {

        loginButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                performLogin();

            }
        );

    } else {

        console.error(
            "[SYL] Botão loginButton não encontrado."
        );

    }


    if (elementExists(userNameInput)) {

        userNameInput.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    performLogin();

                }

            }
        );

    }


    /* =====================================================
       ACESSAR PLATAFORMA
    ===================================================== */

    if (elementExists(accessPlatformButton)) {

        accessPlatformButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                startModule();

            }
        );

    }


    /* =====================================================
       SITE OFICIAL
    ===================================================== */

    const officialButton =
        document.querySelector(
            '[data-action="official"]'
        );

    if (officialButton) {

        officialButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openDevelopmentModal();

            }
        );

    }


    /* =====================================================
       MAPA
    ===================================================== */

    const accessMapButton =
        document.querySelector(
            '[data-action="map"]'
        );

    if (accessMapButton) {

        accessMapButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                startMapModule();

            }
        );

    }


    /* =====================================================
       AJUSTES
    ===================================================== */

    if (elementExists(settingsButton)) {

        settingsButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openSettingsModal();

            }
        );

    }


    /* =====================================================
       DESCONECTAR
    ===================================================== */

    if (elementExists(disconnectButton)) {

        disconnectButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                disconnect();

            }
        );

    }


    /* =====================================================
       MODAL DESENVOLVIMENTO
    ===================================================== */

    if (elementExists(developmentOkButton)) {

        developmentOkButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closeDevelopmentModal();

            }
        );

    }


    if (elementExists(developmentCloseButton)) {

        developmentCloseButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closeDevelopmentModal();

            }
        );

    }


    if (elementExists(developmentOverlay)) {

        developmentOverlay.addEventListener(
            "click",
            function() {

                closeDevelopmentModal();

            }
        );

    }


    /* =====================================================
       COR DO MARCADOR
    ===================================================== */

    if (elementExists(markerColor)) {

        markerColor.addEventListener(
            "input",
            updateMarkerColorPreview
        );

    }


    /* =====================================================
       AJUSTES
    ===================================================== */

    if (elementExists(settingsCloseButton)) {

        settingsCloseButton.addEventListener(
            "click",
            function() {

                closeSettingsModal();

            }
        );

    }


    if (elementExists(settingsCancelButton)) {

        settingsCancelButton.addEventListener(
            "click",
            function() {

                closeSettingsModal();

            }
        );

    }


    if (elementExists(settingsOverlay)) {

        settingsOverlay.addEventListener(
            "click",
            function() {

                closeSettingsModal();

            }
        );

    }


    if (elementExists(applySettingsButton)) {

        applySettingsButton.addEventListener(
            "click",
            function() {

                applySettings();

            }
        );

    }


    /* =====================================================
       FECHAR MAPA
    ===================================================== */

    if (elementExists(closeMapButton)) {

        closeMapButton.addEventListener(
            "click",
            function() {

                closeOperationalMap();

            }
        );

    }


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key !== "Escape") {
                return;
            }


            if (
                developmentModal &&
                developmentModal.classList.contains("active")
            ) {

                closeDevelopmentModal();

                return;

            }


            if (
                settingsModal &&
                settingsModal.classList.contains("active")
            ) {

                closeSettingsModal();

                return;

            }


            if (
                mapScreen &&
                mapScreen.classList.contains("active")
            ) {

                closeOperationalMap();

            }

        }
    );


    /* =====================================================
       MENU ADMIN
    ===================================================== */

    setupAdminOutsideClick();


    console.log(
        "[SYL] Inicializado com sucesso."
    );

}


/* =========================================================
   RELÓGIO CONTÍNUO
========================================================= */

setInterval(
    function() {

        updateClocks();

    },
    1000
);


/* =========================================================
   INICIALIZAÇÃO SEGURA
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSylApplication
    );

} else {

    initializeSylApplication();

}


/* =========================================================
   API PÚBLICA SYL
========================================================= */

window.SYL = {

    getCurrentUser:
        function() {

            return currentUser;

        },


    showScreen:
        function(screen) {

            showScreen(screen);

        },


    startModule:
        function() {

            startModule();

        },


    startMap:
        function() {

            startMapModule();

        },


    closeMap:
        function() {

            closeOperationalMap();

        },


    openDevelopmentModal:
        function() {

            openDevelopmentModal();

        },


    closeDevelopmentModal:
        function() {

            closeDevelopmentModal();

        },


    openSettings:
        function() {

            openSettingsModal();

        },


    closeSettings:
        function() {

            closeSettingsModal();

        },


    getSettings:
        function() {

            return getSavedSettings();

        },


    disconnect:
        function() {

            disconnect();

        },


    isAdmin:
        function() {

            return isSylAdmin();

        },


    getOnlineUsers:
        function() {

            return {
                ...sylOnlineUsers
            };

        },


    getProximityPairs:
        function() {

            return {
                ...sylProximityPairs
            };

        },


    checkProximity:
        function() {

            checkAllProximities();

        },


    syncOnlineUsers:
        function() {

            syncAblyPresence();

        }

};


/* =========================================================
   FIM
========================================================= */

console.log(
    "SAFE YOUR LIFE — SYL carregado."
);
