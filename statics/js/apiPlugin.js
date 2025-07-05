function apiPlugin(a, b) {
    this.element = b;
}

apiPlugin.prototype = {
    // 🔧 Инициализация и конфигурация
    initParam: function(a) {
        this.element.initParam(a);
        return this;
    },

    setUserName: function(username, password) {
        this.element.setUserName(username, password);
        this.name = username;
        this.verify = password;
        return this;
    },

    setDevTimeInfo: function(time, format) {
        this.element.setDevTimeInfo(time, format);
    },

    setDeviceLoginInfo: function(ip, port) {
        this.element.setDevInfo(ip, port);
        this.host = ip;
        this.tcpPort = port;
        return this;
    },

    setHttpPort: function(port) {
        this.element.setHttpPort(port);
        return this;
    },

    setWebVersion: function(ver) {
        this.element.setWebVersion(ver);
    },

    // 🔢 Общая информация
    getPluginVersion: function() {
        return this.element.getFileVersionInfo();
    },

    setPluginPosition: function(width, height) {
        this.element.setViewPosition("0", "0", String(width), String(height));
    },

    setDeviceChannelNum: function(num) {
        this.element.setDeviceInfo(num);
    },

    setPlayWindowNum: function(rows, cols) {
        this.element.setPlayWndNum(rows, cols);
    },

    getPlayWindowNum: function() {
        return this.element.getPlayWndNum();
    },

    getWindowStatus: function(index) {
        return this.element.getWndSta(index);
    },

    getCurrentWindow: function(val) {
        if (val) this.element.strSelWnd = val;
        return this.element.strSelWnd;
    },

    getCurrentChannel: function() {
        return this.element.strSelChannel;
    },

    // 📺 Управление просмотром
    startAllPreview: function(port, windowType, user, pass, streamType, encode) {
        this.element.allStartView(String(this.host), String(port), String(this.name), String(this.verify), String(streamType), String(encode));
    },

    startPreview: function(ch, streamType, encode) {
        this.element.startview(String(this.host), String(ch), String(this.name), String(this.verify), String(streamType), String(encode));
    },

    stopPreview: function(ch) {
        if (ch === "undefined") return;
        this.element.stopview(String(ch));
    },

    stopAllVideo: function() {
        this.element.allStopView();
        return this;
    },

    stopAllAudio: function(ch) {
        this.element.stopAllAudio(ch);
    },

    // 🎙️ Аудио и разговор
    getTalkStatus: function() {
        return this.element.getTalkStatus(this.host, this.tcpPort, this.name, this.verify, 1);
    },

    talkAction: function(enable) {
        return this.element.enableTalkEx(this.host, this.tcpPort, this.name, this.verify, enable);
    },

    audioAction: function(enable) {
        return this.element.enableAudio(String(enable));
    },

    // 🎥 Запись
    startAllRec: function() {
        this.element.onClickedallRec();
    },

    stopAllRec: function() {
        this.element.onClickedallStopRec();
        return this;
    },

    startRec: function(index) {
        this.element.onClickedRec(String(index));
    },

    // 🖼️ Скриншоты и увеличение
    screenshot: function(index) {
        this.element.onClickedPic(String(index));
    },

    zoomAction: function(index, enable) {
        let str = String(index);
        enable ? this.element.zoomVideo(str) : this.element.zoomVideoNull(str);
    },

    // 📦 Управление воспроизведением архива
    getPlayBackFileInfo: function(startY, startM, startD, endY, endM, endD, streamType) {
        this.element.getPlayBackFileInfo(
            String(this.host), String(this.tcpPort), String(this.name), String(this.verify),
            startY, startM, startD, endY, endM, endD,
            0, 0, 0, endD, endM, endY, 23, 59, 59, false, streamType
        );
    },

    getPlayBackMonthRecordStatusEX: function(y, m1, d1, m2, d2, cb) {
        this.element.getPlayBackMonthRecordStatusEX(String(this.host), String(this.tcpPort), String(this.name), String(this.verify),
            y, m1, d1, m2, "1", 0, 0, 0, d2, m2, d2, 23, 59, 59, cb);
    },

    getPlayBackMonthRecordStatus: function(y, m1, d1, m2, d2, cb) {
        this.element.getPlayBackMonthRecordStatus(String(this.host), String(this.tcpPort), String(this.name), String(this.verify),
            y, m1, d1, m2, "1", 0, 0, 0, d2, m2, d2, 23, 59, 59, cb);
    },

    startPlayBack: function(ch, type) {
        this.element.setPlayBack(ch, type);
    },

    pausePlayBack: function(ch) {
        this.element.setPausePlayBack(ch);
    },

    stopPlayBack: function(ch, type) {
        this.element.setStopPlayBack(ch, type);
    },

    audioPlayback: function(enable) {
        this.element.setAudioPlayBack(enable);
    },

    clipsPlayBack: function(enable) {
        this.element.setClipsPlayBack(enable);
    },

    setSlowlyForwardPlayBack: function(enable) {
        this.element.setSlowlyForwardPlayBack(enable);
    },

    setFastForwardPlayBack: function(enable) {
        this.element.setFastForwardPlayBack(enable);
    },

    capturePlayBack: function(ch) {
        this.element.setCapturePicturePlayBack(ch);
    },

    getPlayBackCurrentTime: function(ch) {
        return this.element.getPlayBackCurrentTime(ch);
    },

    // 💾 Загрузка архива
    getDownloadFileInfo: function(y, m, d, ey, em, ed, callback) {
        this.element.getPlayBackFileInfo_loaddown(
            String(this.host), String(this.tcpPort), String(this.name), String(this.verify),
            y, m, d, ey, em, ed, 0, 0, 0, ed, em, ey, 23, 59, 59, callback, 0, false
        );
    },

    downloadRecordFileStart: function(fileName, ch, type, cb) {
        return this.element.downloadRecordFileStart(fileName, ch, type, cb);
    },

    downloadRecordFileStop: function(fileName, type) {
        return this.element.downloadRecordFileStop(fileName, type);
    },

    getDownloadStatus: function(fileName, ch) {
        return this.element.getDownloadStatus(fileName, ch);
    },

    getDownloadProgress: function(fileName, ch) {
        return this.element.getDownloadProgress(fileName, ch);
    },

    openFloder: function() {
        this.element.openDownloadFloder();
    },

    getLocalOptions: function() {
        return this.element.queryAllKey();
    },

    brwoseFolder: function() {
        return this.element.brwoseFolder();
    },

    savePath: function(a, b, c, d, e, f) {
        return this.element.addAllKey(a, b, c, d, e, "0", "0", "0", "0", f);
    },

    // 🖍️ Оверлеи и маски
    setOverlayEnable: function(index, enable, show) {
        this.element.setOverlayEnable(index, enable, show);
    },

    getOverlayCoverConfig: function(ch, index, cb) {
        this.element.getOverlayCoverConfig(ch, index, cb);
    },

    getOverlayCoverConfig1: function(ch, index, cb) {
        this.element.getOverlayCoverConfig1(ch, index, cb);
    },

    getOverlayCoverConfig2: function(ch, index, cb) {
        this.element.getOverlayCoverConfig2(ch, index, cb);
    },

    setOverlayCoverConfig: function(ch, cfg) {
        this.element.setOverlayCoverConfig(
            ch, cfg.width, cfg.height,
            cfg.coverEnable0, cfg.coverX0, cfg.coverY0, cfg.coverW0, cfg.coverH0,
            cfg.txtEnable0, cfg.txtX0, cfg.txtY0, cfg.txtW0, cfg.txtH0,
            cfg.timeEnable0, cfg.timeX, cfg.timeY, cfg.timeW, cfg.timeH
        );
    },

    setOverlayCoverConfig2: function(ch, cfg) {
        this.element.setOverlayCoverConfig1(
            ch, cfg.width, cfg.height,
            cfg.coverEnable1, cfg.coverX1, cfg.coverY1, cfg.coverW1, cfg.coverH1,
            cfg.txtEnable0, cfg.txtX0, cfg.txtY0, cfg.txtW0, cfg.txtH0,
            cfg.timeEnable0, cfg.timeX, cfg.timeY, cfg.timeW, cfg.timeH
        );
    },

    setOverlayCoverConfig3: function(ch, cfg) {
        this.element.setOverlayCoverConfig2(
            ch, cfg.width, cfg.height,
            cfg.coverEnable2, cfg.coverX2, cfg.coverY2, cfg.coverW2, cfg.coverH2,
            cfg.txtEnable0, cfg.txtX0, cfg.txtY0, cfg.txtW0, cfg.txtH0,
            cfg.timeEnable0, cfg.timeX, cfg.timeY, cfg.timeW, cfg.timeH
        );
    },

    // 🎯 Детекция движения и AI
    setMotionDraw: function(config) {
        this.element.setMotionDraw(config);
    },

    delMotionAllDraw: function(config) {
        this.element.delMotionAllDraw(config);
    },

    setMotionData: function(ch, data) {
        this.element.getMotionData(ch, data);
    },

    getMotionData: function(ch) {
        return this.element.setMotionData(ch);
    },

    setSmartyCrossEn: function(val) {
        this.element.setSmartyCrossEn(val);
    },

    setSmartyBlockEn: function(val) {
        this.element.setSmartyBlockEn(val);
    },

    getSmartyBlockPt: function(val) {
        return this.element.getSmartyBlockPt(val);
    },

    setSmartyCrossLine: function(x1, y1, x2, y2) {
        this.element.setSmartyCrossLine(x1, y1, x2, y2);
    },

    getSmartyCrossLine: function(ch) {
        return this.element.getSmartyCrossLine(ch);
    },

    setSmartyCrossRule: function(rule) {
        this.element.setSmartyCrossRule(rule);
    },

    setSmartyCrossType: function(type) {
        this.element.setSmartyCrossType(type);
    },

    setSmartyBlockRule: function(rule) {
        this.element.setSmartyBlockRule(rule);
    },

    setSmartyBlockPt: function(pt) {
        this.element.setSmartyBlockPt(pt);
    },

    // 🖥️ Полноэкранный режим
    setFullScreen: function() {
        this.element.setFullScreen();
    },

    setFullScreenMulti: function() {
        this.element.setFullScreenMulti();
        return this;
    },

    setFullScreenType: function() {
        this.element.setFullScreenType(0);
    },

    isFullScreenDisplay: function() {
        return this.element.isFullScreenDisplay();
    },

    quitFullScreen: function() {
        this.element.quitFullScreen();
    },

    // 📨 События и сообщения
    bindMsg: function(type, callback) {
        this.element.bindMsg(type, callback);
        return this;
    },

    unbindMsg: function(type) {
        this.element.unbindMsg(type);
        return this;
    },

    setWindowType: function(type) {
        this.element.setliveview(String(type));
        return this;
    }
};
