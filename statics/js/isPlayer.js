(function(g, f, b, c) {
    var e = "";
    var a = function(k, j) {
        e = this;
        this.ele = k;
        this.defaults = {
            width: 0,
            height: 0,
            videoType: -1,
            audioType: -1,
            frameRate: 15,
            playMode: PLAY_MODE_PLUGIN,
            host: getHost(),
            port: getHttpPort(),
            autoFill: true,
            fullscreen: false,
            openSound: false,
            isIE: isIE(),
            user: getUserName(),
            auth: getAuth(),
            tcpPort: getTcpPort(),
            rstpPort: getRstpPort(),
            isPlayback: false,
            deviceUrl: "ws://" + getHost() + ":" + getHttpPort(),
            isPluginInstall: false,
            zoomColor: "#ff0000",
            lineWidth: "2",
            smartColor: "#ff0000",
            isConfigVideo: false,
            session: getSessionInfo()
        };
        this.opts = g.extend({}, this.defaults, j);
        this.opts.width = parseInt(this.opts.width);
        this.opts.height = parseInt(this.opts.height);
        this.ele.html(dotRender("pluginModel", {
            mode: this.opts.playMode,
            isWin: isWinOS()
        }));
        this.pluginDiv = this.ele.find(".J-plugin-block")[0];
        this.playType = this.opts.isPlayback ? DEFAULT_PLAYBACK_WINDOW : DEFAULT_WINDOW;
        if (this.opts.isIE) {
            try {
                this.plugin = new apiPlugin(null, g("#plugin")[0]);
                var i = this.plugin.getPluginVersion();
                comparePluginVersions(i, versionconfig.ocx_version) ? updatePlugin() : "";
                this.opts.isPluginInstall = true;
                !comparePluginVersions(i, PLUGIN_SUPPORTS_WEB_VERSION) && this.plugin.setWebVersion(versionconfig.web_version);
                this.plugin.setUserName(this.opts.user, this.opts.auth).setDeviceLoginInfo(this.opts.host, this.opts.tcpPort).setWindowType(this.playType)
            } catch (l) {
                updatePlugin(true)
            }
        } else {
            this.plugin = new apiPlugin(localServerWebsocket, g("#videoBlock"), this.opts.deviceUrl);
            this.opts.playMode = this.opts.videoType == PLAY_MODE_H264 ? PLAY_MODE_H264 : PLAY_MODE_H265;
            this.ele.html(dotRender("pluginModel", {
                mode: this.opts.playMode,
                isWin: isWinOS()
            }));
            if (isSafari() || this.opts.isConfigVideo) {
                return isSafari() ? setTimeout(setSdk, 50) : setSdk()
            }
            this.checkPortAvailable(function(o) {
                var n = e.getUrlProtocol().indexOf("https") > -1 ? "wss://127.0.0.1:" + o : "ws://127.0.0.1:" + o;
                localServerWebsocket.initLocalServerWebsocket({
                    serverUrl: n,
                    deviceUrl: e.opts.deviceUrl,
                    windowNum: e.opts.window
                });
                localServerWebsocket.initSocket();
                var m = localServerWebsocket.websocket.readyState;
                if (m != WS_CLOSING && m != WS_CLOSED) {
                    e.opts.playMode = PLAY_MODE_LOCALSERVER
                }
            }, function() {
                setSdk()
            })
        }
    };
    var d = function(j, i) {
        return [getHost(), getHttpPort(), "CH" + j, new Date().Format("hh_mm_ss." + i)].join("_")
    };
    var h = function(i) {
        return !i || i.left == 0 && i.top == 0 && i.right == 0 && i.bottom == 0
    };
    a.prototype = {
        getPluginInstall: function() {
            return this.opts.isPluginInstall
        },
        setPlayMode: function(i) {
            this.opts.playMode = i
        },
        initVideoWindow: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.initParam(i);
            return this.ele
        },
        destroy: function() {
            this.ele[0].commPlayer = null;
            this.clearAll();
            return this.ele
        },
        clearAll: function() {
            switch (this.opts.playMode) {
                case PLAY_MODE_H264:
                case PLAY_MODE_H265:
                    if (!deviceSdk.wfs) {
                        return this.ele
                    }
                    var k = deviceSdk.wfs.getConfigInfo();
                    for (var j = 0; j < k.length; j++) {
                        deviceSdk.wfs.stopWebsocket(j)
                    }
                    deviceSdk.clientNum = 0;
                    deviceSdk.monitorPlayNum = 0;
                    deviceSdk.wfs.initWebsocketData();
                    deviceSdk.wfs = null;
                    break;
                case PLAY_MODE_PLUGIN:
                    if (!this.opts.isHidePlugin) {
                        this.stopAllVideo()
                    }
                    break;
                case PLAY_MODE_LOCALSERVER:
                    if (this.opts.isHidePlugin && localServerWebsocket) {
                        return localServerWebsocket.stopWebsocket()
                    }
                    if (localServerWebsocket) {
                        this.plugin.stopPreview(-1, this.opts.session);
                        this.plugin.stopTalks(this.opts.session);
                        this.plugin.destroyWindow();
                        localServerWebsocket.stopWebsocket()
                    }
                    break
            }
            return this.ele
        },
        setWindowType: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setWindowType(i);
            return this.ele
        },
        setDevTimeInfo: function(i, j) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setDevTimeInfo(i, j)
        },
        getTalkStatus: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getTalkStatus()
            }
        },
        setDeviceChannelNum: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setDeviceChannelNum(i)
        },
        getCurrentWindow: function(j) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                var i = this.plugin.getCurrentWindow(j);
                setConf("selectWindowIndex", i);
                return i
            }
        },
        getBitRate: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                return this.plugin.getBitRates(i)
            }
        },
        talk: function(j, k, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.stopAllAudio(k);
                    return this.plugin.talkAction(j);
                case PLAY_MODE_LOCALSERVER:
                    j ? this.plugin.startTalks(i.encodeType, i.sampleRate, i.channelCnt, i.bitWide, this.opts.session) : this.plugin.stopTalks(this.opts.session);
                    break
            }
        },
        setPlayWindowNum: function(j, i) {
            !i && (i = 0);
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.setPlayWindowNum(j, i)
            }
        },
        stopAllRec: function() {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.stopAllRec();
            return this.ele
        },
        startAllRec: function() {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.startAllRec()
        },
        stopAllVideo: function() {
            if (this.opts.isPluginInstall && this.opts.playMode == PLAY_MODE_PLUGIN) {
                this.plugin.stopAllVideo()
            }
        },
        startRec: function(l, j, k, i) {
            if (!this.opts.isIE) {
                var m = this.getRootPath(i ? CLIPS_PLAYBACK_PATH : RECORD_FILE_PATH) + this.getSecondPath(l, "avi")
            }
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.startRec(l);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    k ? this.stopRec(i ? j : l, i) : this.plugin.startRec(i ? null : l, j, m);
                    break
            }
            return this.ele
        },
        stopRec: function(j, i) {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.stopRec(j, i);
            return this.ele
        },
        getRootPath: function(k) {
            var m = getConf("localConfig")[k].split("\\"),
                l = "";
            for (var j = 0; j < m.length; j++) {
                l += m[j] + "\\"
            }
            return l
        },
        getSecondPath: function(m, l, k, j) {
            m = m < 9 ? "0" + (Number(m) + 1) : Number(m) + 1;
            var n = k ? k : d(m, l);
            var i = j ? [getDevConf("deviceType") + "_" + getHost() + "_" + j, new Date().Format("yyyy_MM_dd")] : [getDevConf("deviceType") + "_" + getHost(), new Date().Format("yyyy_MM_dd")];
            return i.join("\\") + "\\" + n
        },
        setHttpPort: function() {
            (this.opts.isPluginInstall && this.opts.playMode == PLAY_MODE_PLUGIN) && this.plugin.setHttpPort(this.opts.port);
            return this.ele
        },
        startPreview: function(m, k, i, l, j) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.opts.isPluginInstall && this.plugin.startPreview(this.opts.rstpPort, m, k);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.startPreview(k, m, i, l.videoCode, j, l.frameRate, l.bitRate, l.width, l.height, this.opts.session);
                    break;
                default:
                    break
            }
        },
        stopPreview: function(i) {
            if ((this.opts.isPluginInstall && this.opts.playMode == PLAY_MODE_PLUGIN) || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.stopPreview(i, this.opts.session)
            }
        },
        startAllPreview: function(j, i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.startAllPreview(this.opts.rstpPort, j, i)
        },
        capture: function(k, i, j) {
            if (!this.opts.isIE) {
                k = this.getRootPath(j ? CAPTURE_PLAYBACK_PATH : CAPTURE_LIVE_PATH) + this.getSecondPath(k, "jpg")
            }
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.screenshot(k, i)
            }
        },
        audio: function(j, i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                return this.plugin.audioAction(j, i)
            }
        },
        zoom: function(j, i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.zoomAction(j, i)
            }
            return this.ele
        },
        setFullScreenMulti: function() {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setFullScreenMulti();
            return this.ele
        },
        setFullScreen: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.setFullScreen()
            }
        },
        isFullScreenDisplay: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.isFullScreenDisplay()
            }
        },
        getCurrentChannel: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getCurrentChannel()
            }
        },
        setPluginPosition: function(j, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    return this.plugin.setPluginPosition(j, i);
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.moveWindow();
                    break;
                default:
                    break
            }
        },
        bindMsg: function(i, j) {
            (this.opts.isPluginInstall && this.opts.playMode == PLAY_MODE_PLUGIN) && this.plugin.bindMsg(i, j);
            return this.ele
        },
        unbindMsg: function(i) {
            (this.opts.isPluginInstall && this.opts.playMode == PLAY_MODE_PLUGIN) && this.plugin.bindMsg(i);
            return this.ele
        },
        getWindowStatus: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getWindowStatus(i)
            }
        },
        getPlayBackCurrentTime: function(i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    return this.plugin.getPlayBackCurrentTime(i);
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.getPlayBackCurrentTime(i);
                    break;
                default:
                    break
            }
        },
        stopPlayBack: function(j, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.stopPlayBack(j, i);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.stopPlayBacks(j, this.opts.session);
                    break;
                default:
                    break
            }
        },
        getPlayWindowNum: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getPlayWindowNum()
            }
        },
        getPlayBackFileInfo: function(n, k, j, o, i, p, m, l) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.getPlayBackFileInfo(n, k, j, o, i, p, m, l)
        },
        startPlayBack: function(k, n, l, m, j, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.startPlayBack(k, n);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.startPlayBacks(k, l.channel, l.fileType, j, i, m.videoEncodeType, m.audioEncodeType, m.videoFrameRate, m.videoBitRate, m.videoWidth, m.videoHeight, this.opts.session);
                    break;
                default:
                    break
            }
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.startPlayBack(k, n)
        },
        pausePlayBack: function(i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.pausePlayBack(i);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.pausePlayBacks(i, this.opts.session);
                    break;
                default:
                    break
            }
        },
        audioPlayback: function(j, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.audioPlayback(j);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.audioAction(i, j);
                    break;
                default:
                    break
            }
        },
        clipsPlayBack: function(k, i, j) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.clipsPlayBack(k);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.startRec(j, k, !i, true);
                    break;
                default:
                    break
            }
        },
        setSlowlyForwardPlayBack: function(i, j) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.setSlowlyForwardPlayBack(i);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.setPlaybackSpeeds(i, j, this.opts.session);
                    break;
                default:
                    break
            }
        },
        setFastForwardPlayBack: function(i, j) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.setFastForwardPlayBack(i);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.setPlaybackSpeeds(i, j, this.opts.session);
                    break;
                default:
                    break
            }
        },
        capturePlayBack: function(j, i) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    this.plugin.capturePlayBack(j);
                    break;
                case PLAY_MODE_LOCALSERVER:
                    this.capture(i, j, true);
                    break;
                default:
                    break
            }
        },
        getPlayBackMonthRecordStatus: function(l, k, j, m, i, n) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.getPlayBackMonthRecordStatus(l, k, j, m, i, n)
        },
        getPlayBackMonthRecordStatusEX: function(l, k, j, m, i, n) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.getPlayBackMonthRecordStatusEX(l, k, j, m, i, n)
        },
        getWindowInfo: function(i) {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.getCurrentWindow(i)
        },
        updateWindow: function() {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.updateWindow()
        },
        showWindow: function() {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.showWindow()
        },
        hideWindow: function(i) {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.hideWindow(i)
        },
        resumePlayBack: function(i) {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.resumePlayBacks(i, this.opts.session)
        },
        downloadRecordFileStart: function(n, k, m, j, l, i, o) {
            if (!this.opts.isIE) {
                var o = this.getRootPath(DOWNLOAD_FILE_PATH) + this.getSecondPath(n, "avi", o + ".avi", this.opts.tcpPort)
            }
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                return this.plugin.downloadRecordFileStart(n, k, m, j, "", l, "", i, o, this.opts.session)
            }
        },
        browseFilePath: function() {
            this.opts.playMode == PLAY_MODE_LOCALSERVER && this.plugin.browseFilePaths()
        },
        downloadRecordFileStop: function(j, i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                return this.plugin.downloadRecordFileStop(j, i, this.opts.session)
            }
        },
        getDownloadFileInfo: function(m, k, j, n, i, o, l) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.getDownloadFileInfo(m, k, j, n, i, o, l)
        },
        getDownloadStatus: function(j, i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getDownloadStatus(j, i)
            }
        },
        getDownloadProgress: function(j, i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getDownloadProgress(j, i)
            }
        },
        openDownloadFloder: function() {
            var i = "";
            if (!this.opts.isIE) {
                var j = [getDevConf("deviceType") + "_" + this.opts.host + "_" + this.opts.tcpPort, new Date().Format("yyyy_MM_dd")].join("\\");
                i = this.getRootPath(DOWNLOAD_FILE_PATH) + j
            }
            if (this.opts.playMode == PLAY_MODE_PLUGIN || this.opts.playMode == PLAY_MODE_LOCALSERVER) {
                this.plugin.openFloder(i)
            }
        },
        getLocalOptions: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getLocalOptions()
            }
        },
        brwoseFolder: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.brwoseFolder()
            }
        },
        savePath: function(i, k, n, m, j, l) {
            switch (this.opts.playMode) {
                case PLAY_MODE_PLUGIN:
                    return this.plugin.savePath(i, k, n, m, j, l);
                case PLAY_MODE_LOCALSERVER:
                    this.plugin.setLocalConfigs(i, n, k, m, j);
                    break;
                default:
                    break
            }
        },
        isSmallVideo: function() {
            return this.opts.isConfigVideo
        },
        setOverlayEnable: function(k, j, i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setOverlayEnable(k, j, i)
        },
        getOverlayCoverConfig: function(k, j, i) {
            if (!this.opts.playMode == PLAY_MODE_PLUGIN) {
                return
            }
            return this.plugin.getOverlayCoverConfig(k, j, i)
        },
        getOverlayCoverConfig1: function(k, j, i) {
            if (!this.opts.playMode == PLAY_MODE_PLUGIN) {
                return
            }
            return this.plugin.getOverlayCoverConfig1(k, j, i)
        },
        getOverlayCoverConfig2: function(k, j, i) {
            if (!this.opts.playMode == PLAY_MODE_PLUGIN) {
                return
            }
            return this.plugin.getOverlayCoverConfig2(k, j, i)
        },
        setOverlayCoverConfig: function(i, j) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setOverlayCoverConfig(i, j)
        },
        setOverlayCoverConfig1: function(i, j) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setOverlayCoverConfig2(i, j)
        },
        setOverlayCoverConfig2: function(i, j) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setOverlayCoverConfig3(i, j)
        },
        setDrawBlockNum: function(n, l, s, k, o, r) {
            var j = g("#videoBlock"),
                p = j.find("canvas.draw-box"),
                q = this;
            p.off("mousedown").off("mouseup").off("mouseout");
            if (o) {
                p.prop("width", p.width());
                p.prop("height", p.height());
                this.indexArr = ["", "", ""];
                this.arrBlock = Array(parseInt(n));
                this.clrBlock = l;
                p.off("mousedown").off("mouseup").off("mouseout");
                if (n == 0) {
                    return this.cbBlock = undefined
                }
                this.numBlock = parseInt(n);
                this.cbBlock = s;
                for (var m = 0; m < this.numBlock; ++m) {
                    this.arrBlock[m] = {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        voluation: false
                    }
                }
            } else {
                q.indexArr[r] = r;
                p.on("mousedown", function(u) {
                    q.opBlockIdx = undefined;
                    for (var t = 0; t < 3; ++t) {
                        if (h(q.arrBlock[t]) && q.indexArr[t] !== "") {
                            q.opBlockIdx = t;
                            break
                        }
                    }
                    if (q.opBlockIdx === undefined) {
                        return
                    }
                    q.arrBlock[q.opBlockIdx].left = q.arrBlock[q.opBlockIdx].right = u.offsetX;
                    q.arrBlock[q.opBlockIdx].top = q.arrBlock[q.opBlockIdx].bottom = u.offsetY;
                    p.on("mousemove", function(i) {
                        var v = q.arrBlock[q.opBlockIdx];
                        v.right = i.offsetX;
                        v.bottom = i.offsetY;
                        q.doBlockDraw(k);
                        s && s(q.arrBlock[q.opBlockIdx], q.opBlockIdx)
                    })
                }).on("mouseup", function(t) {
                    if (g.isNumeric(q.opBlockIdx)) {
                        var i = q.arrBlock[q.opBlockIdx];
                        i.right = t.offsetX;
                        i.bottom = t.offsetY;
                        q.doBlockDraw(k);
                        s && s(q.arrBlock[q.opBlockIdx], q.opBlockIdx);
                        p.off("mousemove");
                        q.opBlockIdx = undefined
                    }
                }).on("mouseout", function(i) {
                    if (q.opBlockIdx) {
                        s && s(q.arrBlock[q.opBlockIdx], q.opBlockIdx);
                        q.opBlockIdx = undefined
                    }
                    p.off("mousemove")
                });
                return this.$ele
            }
        },
        doBlockDraw: function(k) {
            if (this.opts.playMode != PLAY_MODE_PLUGIN) {
                var m = g("#videoBlock").find("canvas.draw-box");
                if (m.length == 0) {
                    return
                }
                var j = m[0].getContext("2d");
                m.prop("width", m.width());
                m.prop("height", m.height());
                j.lineWidth = "2";
                j.strokeStyle = "#ff0000", j.clearRect(0, 0, m.width(), m.height());
                if (this.clrBlock) {
                    j.fillStyle = this.clrBlock
                }
                for (var l = 0; l < this.arrBlock.length; ++l) {
                    if (h(this.arrBlock[l])) {
                        continue
                    }
                    j.strokeRect(Math.min(this.arrBlock[l].left, this.arrBlock[l].right), Math.min(this.arrBlock[l].top, this.arrBlock[l].bottom), Math.abs(this.arrBlock[l].right - this.arrBlock[l].left), Math.abs(this.arrBlock[l].bottom - this.arrBlock[l].top));
                    if (this.clrBlock) {
                        j.fillRect(Math.min(this.arrBlock[l].left, this.arrBlock[l].right), Math.min(this.arrBlock[l].top, this.arrBlock[l].bottom), Math.abs(this.arrBlock[l].right - this.arrBlock[l].left), Math.abs(this.arrBlock[l].bottom - this.arrBlock[l].top))
                    }
                }
            }
            return this.$ele
        },
        addBlockData: function(m, q, p, j, k) {
            for (var n = 0; n < this.addBlockData.length; ++n) {
                if (!h(this.arrBlock[n]) || this.arrBlock[n].voluation == true) {
                    continue
                }
                var o = g("#videoBlock").find("canvas.draw-box");
                o.prop("width", o.width());
                o.prop("height", o.height());
                var l = o.width(),
                    r = o.height();
                this.arrBlock[n].left = Math.round(l * m);
                this.arrBlock[n].top = Math.round(r * p);
                this.arrBlock[n].right = Math.round(l * q);
                this.arrBlock[n].bottom = Math.round(r * j);
                this.arrBlock[n].voluation = true;
                this.cbBlock && this.cbBlock(this.arrBlock[n], n);
                break
            }
            return this.$ele
        },
        delBlockData: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                this.plugin.delBlockData(i)
            } else {
                if (this.arrBlock.length > i) {
                    this.indexArr[i] = "";
                    this.arrBlock[i].left = this.arrBlock[i].top = this.arrBlock[i].right = this.arrBlock[i].bottom = 0;
                    this.cbBlock && this.cbBlock(this.arrBlock[i], i);
                    this.doBlockDraw()
                }
            }
            return this.$ele
        },
        getBlockData: function() {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getBlockData()
            } else {
                if (this.arrBlock) {
                    var m = g("#videoBlock").find("canvas.draw-box");
                    var n = m.width(),
                        j = m.height();
                    var k = [];
                    for (var l = 0; l < this.arrBlock.length; ++l) {
                        if (this.arrBlock[l]) {
                            k.push({
                                x1: this.arrBlock[l].left / n,
                                y1: this.arrBlock[l].top / j,
                                x2: this.arrBlock[l].right / n,
                                y2: this.arrBlock[l].bottom / j
                            })
                        } else {
                            k.push({
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 0
                            })
                        }
                    }
                    return k
                } else {
                    return []
                }
            }
        },
        setMDBlkSize: function(r, q) {
            var n = g("#videoBlock").find("canvas.draw-box");
            this.arrMD = [];
            n.off("mousedown").off("mouseup").off("mouseout");
            if (r == 0 || q == 0) {
                return
            }
            this.opts.mdx = parseInt(r);
            this.opts.mdy = parseInt(q);
            this.arrMD = new Array(this.opts.mdx * this.opts.mdy);
            for (var l = 0; l < this.arrMD.length; ++l) {
                this.arrMD[l] = 0
            }
            var o = this,
                k = n.width(),
                p = n.height(),
                m = k / this.opts.mdx,
                j = p / this.opts.mdy;
            n.on("mousedown", function(u) {
                var s = Math.floor(u.offsetX / m),
                    i = Math.floor(u.offsetY / j);
                var t = g.extend([], o.arrMD);
                t[i * o.opts.mdx + s] ^= 1;
                o.doMDDraw(t);
                n.on("mousemove", function(w) {
                    var z = Math.floor(w.offsetX / m),
                        y = Math.floor(w.offsetY / j);
                    if (z == s && y == i) {
                        return
                    }
                    var x, E, D, v;
                    if (s > z) {
                        x = z;
                        E = s
                    } else {
                        x = s;
                        E = z
                    }
                    if (i > y) {
                        D = y;
                        v = i
                    } else {
                        D = i;
                        v = y
                    }
                    var C = g.extend([], o.arrMD);
                    for (var B = x; B <= E; ++B) {
                        for (var A = D; A <= v; ++A) {
                            C[A * o.opts.mdx + B] ^= 1
                        }
                    }
                    o.doMDDraw(C)
                })
            }).on("mouseup", function(i) {
                if (o.drawMD) {
                    o.arrMD = o.drawMD;
                    o.drawMD = undefined
                }
                n.off("mousemove")
            }).on("mouseout", function(i) {
                if (o.drawMD) {
                    o.arrMD = o.drawMD;
                    o.drawMD = undefined
                }
                n.off("mousemove")
            });
            return this.$ele
        },
        doMDDraw: function(s, o) {
            var q = g("#videoBlock").find("canvas.draw-box");
            if (!q.length) {
                return
            }
            var t = q[0].getContext("2d"),
                l = q.width(),
                r = q.height(),
                p = l / this.opts.mdx,
                k = r / this.opts.mdy;
            q.prop("width", l);
            q.prop("height", r);
            t.strokeStyle = this.opts.zoomColor;
            t.clearRect(0, 0, l, r);
            for (var n = 0; n < this.opts.mdx; ++n) {
                for (var m = 0; m < this.opts.mdy; ++m) {
                    s[m * this.opts.mdx + n] == 1 && t.strokeRect(n * p, m * k, p, k)
                }
            }
            this.drawMD = s;
            if (o) {
                this.arrMD = g.extend([], s)
            }
            return this.$ele
        },
        setMotionDraw: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setMotionDraw(i)
        },
        delMotionAllDraw: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.delMotionAllDraw(i)
        },
        setMotionData: function(j, i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setMotionData(j, i)
        },
        getMotionData: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getMotionData(i)
            }
            return this.arrMD
        },
        setSmartyCrossEn: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyCrossEn(i)
        },
        setSmartyBlockEn: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyBlockEn(i)
        },
        getSmartyBlockPt: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getSmartyBlockPt(i)
            }
        },
        setSmartyCrossLine: function(j, l, i, k) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyCrossLine(j, l, i, k)
        },
        getSmartyCrossLine: function(i) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                return this.plugin.getSmartyCrossLine(i)
            }
        },
        setSmartyCrossRule: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyCrossRule(i)
        },
        setSmartyCrossType: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyCrossType(i)
        },
        setSmartyBlockRule: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyBlockRule(i)
        },
        setSmartyBlockPt: function(i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartyBlockPt(i)
        },
        setQuadrilateralDraw: function(p, l, k) {
            if (this.opts.playMode != PLAY_MODE_PLUGIN) {
                var o = g(this.ele).find("canvas.draw-box"),
                    j = o[0].getContext("2d"),
                    i = false,
                    m = [],
                    n = this;
                if (l) {
                    m = [];
                    j.clearRect(ZERO_COORDINATE, ZERO_COORDINATE, o.width(), o.height());
                    o.off("mousedown")
                }
                if (k) {
                    o.on("mousedown", function(q) {
                        if (m.length <= QUADRILATERAL_POINT_LIMIT - 1 && !i) {
                            m.push({
                                x: String(q.offsetX),
                                y: String(q.offsetY)
                            });
                            n.drawPolygon(m)
                        } else {
                            i = true;
                            o.off("mousemove")
                        }
                        if (m.length == QUADRILATERAL_POINT_LIMIT) {
                            o.off("mousemove");
                            p && p(m)
                        }
                    }).on("mousemove", function(q) {
                        m.length >= 1 && n.drawPolygon(m.concat({
                            x: String(q.offsetX),
                            y: String(q.offsetY)
                        }))
                    })
                }
            }
        },
        drawPolygon: function(l, o, q, n) {
            if (this.opts.playMode != PLAY_MODE_PLUGIN) {
                var p = g(this.ele).find("canvas.draw-box"),
                    j = p[0].getContext("2d"),
                    m = o ? ZERO : 1;
                p.prop("width", p.width());
                p.prop("height", p.height());
                j.lineWidth = this.opts.lineWidth;
                j.strokeStyle = this.opts.smartColor;
                j.clearRect(ZERO_COORDINATE, ZERO_COORDINATE, p.width(), p.height());
                j.beginPath();
                j.moveTo(l[ZERO].x, l[ZERO].y);
                for (var k = m; k < l.length; k++) {
                    j.arc(l.x, l.y, 1, ZERO, Math.PI * TWO);
                    j.lineTo(l[k].x, l[k].y)
                }
                j.closePath();
                j.stroke();
                o && this.pointDrag(p, l, q, n)
            }
        },
        setAreaBlock: function(k, j, i) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.setSmartModeAndNum(k, j, this.opts.smartColor, i);
            return this.$ele
        },
        setDrawArea: function(i, k, j) {
            this.drawPolygon(i, k, null, j)
        },
        getDrawArea: function(j) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                var i = this.plugin.getSmartBlkData();
                j(i)
            }
        },
        addDrawArea: function(i) {
            this.plugin.addSmartBlkData(i)
        },
        setRegion: function(i, j) {
            if (this.opts.playMode == PLAY_MODE_PLUGIN) {
                j ? this.plugin.setLineCrossIndex(i) : this.plugin.setWarnRegionIndex(i)
            }
            return this.$ele
        },
        setDrawBtn: function(i, j, m, n, l) {
            if (m) {
                var k = [{
                    x: "253",
                    y: "56"
                }, {
                    x: "253",
                    y: "248"
                }];
                k.length && this.drawPolygon(k, m, n, l)
            } else {
                this.setQuadrilateralDraw(n, true, j)
            }
        },
        clearDrawBtn: function(j, n) {
            var l = g("#videoBlock").find("canvas.draw-box");
            if (!l.length) {
                return
            }
            var k = l[0].getContext("2d"),
                m = l.width(),
                i = l.height();
            k.clearRect(ZERO_COORDINATE, ZERO_COORDINATE, m, i);
            this.setQuadrilateralDraw(null, true, false)
        },
        setDreciton: function(i, j) {
            this.opts.playMode == PLAY_MODE_PLUGIN && this.plugin.selectLineCrossDreciton(i, j);
            return this.$ele
        },
        pointDrag: function(j, l, p, n) {
            var k = false,
                o = "",
                m = this,
                i = j[0].getContext("2d");
            m.drawText(i, l, n);
            j.on("mousedown", function(t) {
                var q = String(t.offsetX),
                    u = String(t.offsetY);
                for (var r = 0; r < l.length; r++) {
                    var s = Math.sqrt(Math.pow(l[r].x - q, TWO) + Math.pow(l[r].y - u, TWO));
                    if (s <= 4) {
                        k = true;
                        o = r;
                        return
                    }
                }
            }).on("mousemove", function(q) {
                if (k) {
                    l[o].x = String(q.offsetX);
                    l[o].y = String(q.offsetY);
                    m.drawPolygon(l);
                    m.drawText(i, l, n)
                }
            }).on("mouseup", function(q) {
                k = false;
                p && p(l)
            });
            p && p(l)
        },
        drawText: function(z, x, u) {
            var y = DIRECTION_TEXT[u],
                k = x[0],
                s = x[1],
                m = s.x - k.x,
                j = s.y - k.y,
                q = Math.sqrt(Math.pow(m, TWO) + Math.pow(j, TWO)),
                r = j / q,
                p = m / q,
                w = q / 2,
                v = {
                    eM11: p,
                    eM12: r,
                    eM21: 0 - r,
                    eM22: p,
                    eDx: k.x - p * k.x + r * k.y,
                    eDy: k.y - p * k.y - r * k.x
                };
            for (var o in y) {
                var t = {};
                switch (y[o]) {
                    case "B":
                        t = {
                            x: Math.round(parseInt(k.x) + w),
                            y: Math.round(parseInt(k.y) - 2 * 2 - 30)
                        };
                        break;
                    case "A":
                        t = {
                            x: Math.round(parseInt(k.x) + w),
                            y: Math.round(parseInt(k.y) + 2 * 2 + 30)
                        };
                        break
                }
                var n = Math.round(t.x * v.eM11 + t.y * v.eM21 + v.eDx),
                    l = Math.round(t.x * v.eM12 + t.y * v.eM22 + v.eDy);
                z.font = "18px bold 黑体";
                z.fillStyle = "#f00";
                z.fillText(y[o], n, l)
            }
        },
        checkPortAvailable: function(q, o) {
            var p = 0,
                m = "",
                l = PORT_RANGE.length,
                j = false,
                k = this.getUrlProtocol(),
                n = this,
                i = 0;
            func = function() {
                var r = k + PORT_RANGE[p] + "/res.bmp";
                if (p >= l) {
                    if (o && !port) {
                        j = true;
                        o()
                    }
                    return clearInterval(m)
                }
                p++;
                var s = r + "?timeStamp=" + new Date().getTime();
                n.xmlHttpRequest("GET", s, {
                    url: r
                }, function(t) {
                    if (t == HTTP_OK) {
                        port = PORT_RANGE[p - 1];
                        clearInterval(m);
                        return q && q(port)
                    }
                }, function() {
                    i++;
                    if (i == 10 && !j) {
                        return o && o()
                    }
                })
            };
            m = setInterval(func, 600)
        },
        getUrlProtocol: function() {
            return "http://127.0.0.1:"
        },
        xmlHttpRequest: function(k, j, m, n, i) {
            var l = new XMLHttpRequest();
            l.open(k, j);
            l.send(JSON.stringify(m));
            l.onload = function(o) {
                n && n(l.status, l.responseText)
            };
            l.onerror = function(o) {
                i && i()
            }
        },
        getChromeVersion: function() {
            if (navigator.userAgent.indexOf("Edg") > -1) {
                return false
            }
            var j = navigator.userAgent.split(" ");
            var l = "";
            for (var k = 0; k < j.length; k++) {
                if (/chrome/i.test(j[k])) {
                    l = j[k]
                }
            }
            return l ? Number(l.split("/")[1].split(".")[0]) : false
        }
    };
    g.fn.isPlayer = function(i) {
        if (this.length === 0) {
            console.log("Video selector empty", i)
        } else {
            if (!this[0].commPlayer) {
                if (typeof i !== "object") {
                    return this
                }
                this[0].commPlayer = new a(this, i);
                return this
            } else {
                if (!i || !this[0].commPlayer[i]) {
                    console.log("Func name " + i + " not exist.")
                } else {
                    return this[0].commPlayer[i].apply(this[0].commPlayer, Array.prototype.slice.call(arguments, 1))
                }
            }
        }
        return this
    }
})(jQuery, window, document);