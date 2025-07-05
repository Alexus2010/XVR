var playbackVariables = {
    timeShaft: null,
    shaftZoomSize: 7,
    windowDownload: null,//下载窗口
    mapMonth: new Array(64), // 月份录像数据, 格式 => [ch][type][yyyymm]
    arrayWindowRec: new Array(16), // 窗口绑定的录像数据
    lastSoundWindow: -1,// 快进慢放恢复正常后开启声音用
    lastWindowDate: new Array(16),// 窗口当前绑定的搜索日期
    fileBackupDatabit: null,
    playWindowNum: 0,
    lastTime: null,
    channelByTimeShaft: null,
    fragmentIndex: 0,
    fragmentVideoInfo: {},//获取播放视频片段信息
    fragmentTimeInfo: {},//获取播放时间片段信息
    windowInfo: {},//窗口信息
    timeZooe: new Date().getTimezoneOffset() * 60 * 1000,
    speed: 0,
    windowNum: 4,
    ieTriggerStop: false
};

function onLoad() {
    initDot();
    setTitle(lang.playback);

    // 初始化播放器
    $('#videoBlock').isPlayer({
        'width': 1920,
        'height': 1080,
        'isPlayback': true,
        'window': initPlaybackWindow()
    }).on('contextmenu', function (e) {
        if (isIE()) return false;
    });

    //谷歌
    !isIE() && document.addEventListener('visibilitychange', newHandle);

    setWindowInfo();
    initPlayback();
    initPlaybackEvent();
    loadTime(function (devTz, devDst) {
        // 初始化
        initTimeline();
        $('#videoBlock').isPlayer('setDevTimeInfo', devTz, devDst);
        $(".J-channel-list li").click(function () {
            var index = $(this).attr("value");
            if (nPlaybackDatabit[index] == 0) return rightPopup(lang.nolimit);
            $(this).parent().children("li.select").removeClass("select").end().end().addClass("select").attr("value");
            searchFile();
        }).eq(0).click();
    });

    if (isXVR()) {
        $('#searchTypeList option').each(function (index) {
            $(this).attr('num', XVR_VIDEO_TYPE_LIST[index]);
        });
    };
    // WiFi设备不支持智能事件
    if (isWifiNvr()) {
        $('#searchTypeList option').each(function (index) {
            if (index > 2) {
                toggleOption($("#searchTypeList option").eq(index), "hide");
            }
        });
    }

    // LOGO
    $("#deviceType").text(getDeviceName());
    (!isIE() && !isSafari()) && loading(true);
}

function onBeforeunload() {
    document.removeEventListener('visibilitychange', newHandle);
    window.shaftTimers && clearInterval(window.shaftTimers);
    isIE() && $('#videoBlock').isPlayer('unbindMsg', 'selWndChg').isPlayer('unbindMsg', 'pbEnd');
    $('#videoBlock').isPlayer('destroy');
    playbackVariables.windowDownload && !playbackVariables.windowDownload.closed && playbackVariables.windowDownload.close();
}

/**
 * 初始化事件
 */
function initPlaybackEvent() {
    // 选择窗口
    $('.J-window-select a').on('click', function () {
        var index = $(this).attr('data-num');
        showWindowNum(index);
    });

    $('.J-middle-btn-block button').on('click', function () {
        var funcName = $(this).attr('data-func');
        if (funcName) {
            var data = getFuncName(funcName);
            window[data.func](data.param);
        };
    });

    // 录像类型
    $("#searchTypeList").change(function () {
        searchFile();
    });

    // 搜索
    $('.J-search-time').on('click', function () {
        searchFile();
    });

    // 缩小
    $('.J-narrow').on('click', function () {
        zoomNarrow();
    });

    // 放大
    $('.J-expand').on('click', function () {
        zoomExpand();
    });
}

/**
 * 获取设备支持的窗口数
 */
function initPlaybackWindow() {
    if (isNVR()) {
        var numPlayWnd = 1,
            chNum = getTotalChannelNum();
        if (isXVR() && !isCpuEq("CPU_3520DV200")) numPlayWnd = 4;
        if (chNum >= 16 && (!isCpuEq(11) || !isCpuEq(30) || !isCpuEq(40)) || chNum == 9 && isCpuEq(10) || chNum == 9 && isCpuEq(40) || chNum == 4 && isCpuEq(40)) {
            numPlayWnd = 4;
        } else {
            numPlayWnd = 1;
        };
        if (isNVR()) {
            if (chNum >= 16 || (chNum == 9 && isCpuEq(10, 3, 30)) || isCpuEq(11, 12)) numPlayWnd = 4;
        } else if (isXVR() && isCpuEq("CPU_3531A_8AHD", "CPU_3531A_8SDI_334S", "CPU_3531D_8SDI_334S", "CPU_3531A_16AHD_NTR_2826")) {
            numPlayWnd = getIPCNum() == chNum ? 1 : 4;
        };
        (isCpuEq("CPU_3520DV400_4AHD_NRT_6158C_2G") || isCpuEq("CPU_3520DV400_4AHD_1080N_RT_6158C")) && (numPlayWnd = 1);
        return numPlayWnd;
    };
    if (isXVR()) {
        var numPlayWnd = 4,
            window = getDevConf('playbackNum');
        if (window < 4) numPlayWnd = 1;
        return numPlayWnd;
    };
}

function initPlayback() {
    var player = $('#videoBlock');
    (isIE() && !player.isPlayer('getPluginInstall')) && initTimeline();
    player.isPlayer('initVideoWindow', getDeviceValue()).isPlayer('setDeviceChannelNum', getTotalChannelNum());
    playbackVariables.fileBackupDatabit = nFileBackupDatabit;
    var numPlayWnd = initPlaybackWindow();
    if (numPlayWnd > 1) {
        $(".J-window-select").show();
        $("#winodw4").show();
    } else {
        showWindowNum(1);
    };

    // 搜索类型
    if (!getConf("isSmartDetectEn")) {
        $(".J-smart").remove();
    } else {
        $(".J-nvr-smart").html(lang.motionDetecting);
        if (!getConf("isNvrAlarmInEn")) {
            toggleOption($(".J-smart").eq(0), "hide");
            toggleOption($(".J-smart").eq(1), "hide");
        } else {
            getConf("isXvrNoMotionAlarmType") ? toggleOption($(".J-smart").eq(1), "hide") : toggleOption($(".J-smart").eq(1), "show");
        }
        if (getConf("isXvrSearchType")) {
            toggleOption($(".J-smart").eq(3), "hide");
            toggleOption($(".J-smart").eq(4), "hide");
            toggleOption($(".J-smart").eq(5), "hide");
            toggleOption($(".J-smart").eq(6), "hide");
        }
        !isXVR() && toggleOption($(".J-smart").eq(8), "hide");
        !getConf("isXvrLink") && toggleOption($(".J-smart").eq(7), "hide");
        !getDevConf('supportFaceCompare') && toggleOption($(".J-smart").eq(7), "hide");
    }
    (isCpuEq("CPU_3520DV400_4AHD_NRT_6158C_2G")) && $("#sound").parent().remove();

    if (isXVR()) {
        toggleOption($(".J-smart").eq(2), "hide");
        toggleOption($(".J-smart").eq(3), "hide");
        toggleOption($(".J-smart").eq(4), "hide");
        toggleOption($(".J-smart").eq(5), "hide");
        toggleOption($(".J-smart").eq(6), "hide");
        toggleOption($(".J-smart").eq(7), "hide");
        (!getConf("isCPUMC6630")) && toggleOption($(".J-smart").eq(8), "hide"); // XVR非6630系列隐藏人形检测
    }

    // 视频操作
    player.isPlayer('bindMsg', 'selWndChg', onSelectWindowChange).isPlayer('bindMsg', 'pbEnd', onPlaybackEnd).isPlayer('stopAllVideo');
    player.isPlayer('setPlayWindowNum', numPlayWnd);
    playbackVariables.playWindowNum = numPlayWnd;
    $(window).resize(onPlaybackResize).resize();
    setConf('selectWindowIndex', 0);
};

/**
 * 初始化时间轴
 */
function initTimeline() {
    var initDate = new Date(nDeviceYear, nDeviceMonth - 1, nDeviceDay);
    $("#calendar").commCal({
        "minDate": new Date(2000, 0, 1),
        "maxDate": initDate,
        "bUsePdCal": getConf("bUsePdCal"),
        "dateSel": initDate,
        "onChangeMonthYear": onCalMonthYearChg,
        "hightlightMax": getRecDayLimit()[getDevConf('recordDayNum')]
    });
    var canvas = $("#timeline")[0];
    //返回一个用于在画布上绘图的环境,一个 CanvasRenderingContext2D 对象，使用它可以绘制到 Canvas 元素中
    //当前唯一的合法值是 "2d"，它指定了二维绘图，并且导致这个方法返回一个环境对象，该对象导出一个二维绘图 API
    if (canvas.getContext) {
        var width = document.body.clientWidth;
        playbackVariables.timeShaft = new T(canvas, (width), 60);
        playbackVariables.timeShaft.C(playMouseUp);
        $("#timeline").on("mousewheel", function (e) {
            if (e.originalEvent) e.originalEvent.wheelDelta > 0 ? zoomExpand() : zoomNarrow();
        });
    } else {
        $("#timeline").html('');
    }
}

/**
 * 回调事件IE
 * @param {*} prm
 */
function onSelectWindowChange(prm) {
    var id = isIE() ? prm.new : prm,
        windowStatus = isIE() ? $('#videoBlock').isPlayer('getWindowStatus', id) : getWindowInfo(id),
        channel = windowStatus.ch,
        cal = $("#calendar");
    if (channel !== -1) {//通道绑定
        setSelectChannel(channel);
        var windowRec = getWindowDayRec(id);
        var type = windowRec[1];
        cal.commCal("hlDates", getChannelMonthRec(channel, type, playbackVariables.lastWindowDate[id])).commCal("setSelDate", playbackVariables.lastWindowDate[id]);
        if (isIE()) {
            $("#searchTypeList").val(windowRec[1]);
        } else {
            var num = $("#searchTypeList option[num = " + windowRec[1] + "]").val();
            $("#searchTypeList").val(num);
        };
        setTimeShaft(id, windowRec[0], type, playbackVariables.lastWindowDate[id], playbackVariables.lastWindowDate[id]);
    } else {
        clearTimeShaft();
        setSelectChannel(-1);
        cal.commCal("hlDates", []).commCal("setSelDate");
    };
    setWindowInfo(id, { 'wnd': id });
    refreshPlayStatus(windowStatus);
    enTimeShaftTimer(id, windowStatus.playing == 1);
}

/**
 * 回放结束回调IE
 * @param {*} wnd
 */
function onPlaybackEnd(wnd) {
    setStopPlayBack(true);
}

function onPlaybackResize() {
    playbackVariables.timeShaft && playbackVariables.timeShaft.E($("#playbackBar").width(), 60);
    var player = $('#videoBlock'), percent = detectZoom();
    player.isPlayer('setPluginPosition', player.width() * percent, player.height() * percent);
}

/**
 * 刷新播放器播放状态(参数窗口下标跟当前选中窗口下标一致时), 刷新左侧通道列表播放状态
 * @param  {object} prm 可选, 播放状态参数, 不填时默认取当前选中窗口的播放状态
 * @return {void}
 */
function refreshPlayStatus(prm) {
    if (!prm) prm = isIE() ? $('#videoBlock').isPlayer('getWindowStatus') : getWindowInfo(getConf('selectWindowIndex'));
    if (prm.wnd == (isIE() ? $('#videoBlock').isPlayer('getCurrentWindow') : getConf('selectWindowIndex'))) {
        switch (prm.playing) {
            case 1:
                // 播放中
                setPlayStatus(false);
                setPlayStopSta(true);
                setPlaySpSta(true);
                if (prm.pbSpeed == 0) {
                    setSoundSta(prm.sound ? true : false);
                    setPlayRecordSta(prm.recording ? true : false);
                } else {
                    setSoundSta(false, true);
                    setPlayRecordSta(false, true);
                }
                setZoomSta(prm.zooming ? true : false);
                setPlayCapSta(true);
                setSpeedTxt(prm.pbSpeed);
                break;
            case 2:
                // 暂停
                setPlayStatus(true);
                setPlayStopSta(true);
                setPlaySpSta(false);
                setSoundSta(false, true);
                setZoomSta(false, true);
                setPlayCapSta(true);
                setPlayRecordSta(false, true);
                setSpeedTxt(prm.pbSpeed);
                break;
            default:
                // 未播放
                setPlayStatus(true);
                setPlayStopSta(false);
                setPlaySpSta(false);
                setSoundSta(true, true);
                setZoomSta(false, true);
                setPlayCapSta(false);
                setPlayRecordSta(false, true);
                setSpeedTxt(null);
                break;
        }
    }
    $(".J-channel-list .playing").removeClass("playing");
    for (var i = 0; i < playbackVariables.playWindowNum; ++i) {
        var windowStatus = isIE() ? $('#videoBlock').isPlayer('getWindowStatus', i) : getWindowInfo(i);
        windowStatus.playing != 0 && $("#play" + windowStatus.ch).addClass("playing");
    }
}

/**
 * 切换窗口
 * @param {*} num
 */
function showWindowNum(num) {
    var player = $('#videoBlock');
    num = ParseInt(num);
    if (num == player.isPlayer('getPlayWindowNum')) return;
    var showWnd = ParseInt(player.isPlayer('getCurrentWindow'));
    switch (num) {
        case 1:
            $("#splitScreen").removeClass().addClass("tool-icons window1");
            if (isIE()) {
                // 先检测选中窗口是否播放, 否则切换到第一个播放中的窗口
                var selWnd = ParseInt(player.isPlayer('getCurrentWindow'));
                var windowStatus = player.isPlayer('getWindowStatus', selWnd);
                if (windowStatus.playing != 0) {
                    showWnd = selWnd;
                } else {
                    var wndNum = player.isPlayer('getPlayWindowNum');
                    for (var i = 0; i < wndNum; ++i) {
                        if (i === selWnd) continue;
                        windowStatus = player.isPlayer('getWindowStatus', i);
                        if (windowStatus.playing != 0) {
                            showWnd = i;
                            player.isPlayer('getCurrentWindow') = i;
                            break;
                        }
                    }
                }
            }
            break;
        case 4:
            $("#splitScreen").removeClass().addClass("tool-icons window-icon-btn");
            break;
        case 16:
            $("#splitScreen").removeClass().addClass("tool-icons window16");
            break;
    };
    playbackVariables.windowNum = num;
    player.isPlayer('setPlayWindowNum', num, showWnd);
}

function onCalMonthYearChg(date) {
    var player = $('#videoBlock');
    var wnd = isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    if (windowStatus.playing != 0) {
        // 播放中不能切换日历
        $("#calendar").commCal("setSelDate", playbackVariables.lastWindowDate[wnd]);
        rightPopup(lang.pb7);
    } else if (!playbackVariables.channelByTimeShaft) {
        // 拖动时间轴更改月份由mouseup回调处理
        var ch = getSelectChannel();
        if ($.isNumeric(ch)) {
            var monthRec = getChannelMonthRec(ParseInt(ch), $("#searchTypeList").val(), date);
            if (monthRec && monthRec.length > 0) {
                var wnd = ParseInt(player.isPlayer('getCurrentWindow'));
                if (playbackVariables.lastWindowDate[wnd] > date) {
                    // 月份减少, 显示最后一天有录像的时间
                    date = monthRec[monthRec.length - 1];
                } else {
                    date = monthRec[0];
                }
            }
        }
        $("#calendar").commCal("setSelDate", date);
        searchFile(null, true);
    }
    playbackVariables.channelByTimeShaft = false;
}

/**
 * 更新日期的录像数据, 窗口参数跟当前选中窗口一致时同时刷新时间轴
 * @param  {int} wnd    窗口下标
 * @param  {array} arrRec 录像数据
 * @param  {int} type   录像类型
 * @param  {date} date   录像日期
 * @return {void}
 */
function refreshDayRec(wnd, arrRec, type, date) {
    if (isIE()) {
        wnd == $('#videoBlock').isPlayer('getCurrentWindow') && setTimeShaft(wnd, arrRec, type, date);
    } else {
        date = new Date(date);
        setTimeShaft(wnd, arrRec, type, date);
    }
    playbackVariables.lastWindowDate[wnd] = date;
    arrRec.length == 0 && rightPopup(lang.pb8);
}

/**
 * 搜索天的录像
 * @param {*} ch
 * @param {*} type
 * @param {*} date
 * @param {*} wnd
 * @param {*} callback
 */
function searchDayRec(ch, type, date, wnd, callback) {
    var year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    var conv = function (jsonFileInfo) {
        var arrRec = eval('[' + jsonFileInfo + ']');
        setWindowDayRec(wnd, arrRec, type, date);
        callback && callback(arrRec);
    };
    $('#videoBlock').isPlayer('getPlayBackFileInfo', ch, type, year, month, day, conv, wnd, isXVR());
}

/**
 * 搜索月份记录
 * @param {*} ch
 * @param {*} type
 * @param {*} date
 * @param {*} wnd
 * @param {*} callback
 */
function searchMonthRec(ch, type, date, wnd, callback) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1;
    var funcName = isXVR() ? "getPlayBackMonthRecordStatus" : "getPlayBackMonthRecordStatusEX";
    var cal = $("#calendar");
    var player = $('#videoBlock');
    cal.commCal("hlDates", []);
    if (getConf("bUsePdCal")) {
        // 波斯历一个月可能跨2个公历月, 要取两个月的录像数据合并显示
        var firstDate = cal.commCal("getMonthFirstDay", date);
        var lastDate = cal.commCal("getMonthLastDay", date);
        if (firstDate.getMonth() !== lastDate.getMonth()) {
            var allRec = [];
            // 本地端查询接口不支持并发查询, 否则会导致数据异常
            year = lastDate.getFullYear(), month = lastDate.getMonth() + 1;
            player.isPlayer(funcName, ch, type, year, month, getMonDays(year, month), function (jsonFileInfo) {
                allRec = allRec.concat($.map(eval('([' + jsonFileInfo.substr(0, jsonFileInfo.length - 1) + '])'), function (node) {
                    return new Date(node.RecordStatusDay);
                }));
                year = firstDate.getFullYear(), month = firstDate.getMonth() + 1;
                player.isPlayer(funcName, ch, type, year, month, getMonDays(year, month), function (jsonFileInfo) {
                    allRec = allRec.concat($.map(eval('([' + jsonFileInfo.substr(0, jsonFileInfo.length - 1) + '])'), function (node) {
                        return new Date(node.RecordStatusDay);
                    }));
                    allRec.sort(function (a, b) { return a.getTime() - b.getTime(); });
                    // 裁剪不在波斯月的数据
                    var len = 0;
                    for (var i = 0; i < allRec.length; ++i) {
                        if (cmpInDay(firstDate, allRec[i]) > 0) {
                            ++len;
                        } else {
                            break;
                        }
                    }
                    len > 0 && allRec.splice(0, len);
                    var idx = -1;
                    for (var i = allRec.length - 1; i >= 0; --i) {
                        if (cmpInDay(lastDate, allRec[i]) < 0) {
                            idx = i;
                        } else {
                            break;
                        }
                    }
                    idx >= 0 && allRec.splice(idx, allRec.length - idx);
                    setChannelMonthRec(ch, type, date, allRec);
                    callback && callback(allRec);
                });
            });
            return;
        }
    }
    player.isPlayer(funcName, ch, type, year, month, getMonDays(year, month), function (jsonFileInfo) {
        var arrRec = $.map(eval('([' + jsonFileInfo.substr(0, jsonFileInfo.length - 1) + '])'), function (node) {
            var time = node.RecordStatusDay.split('-');
            return new Date(time[0], time[1] - 1, time[2]);
        });
        arrRec.sort(function (a, b) { return a.getTime() - b.getTime(); });
        setChannelMonthRec(ch, type, date, arrRec);
        callback && callback(arrRec);
    });
}

/**
 * 获取通道录像信息
 * @param {*} ch
 * @param {*} type
 * @param {*} date
 */
function getChannelMonthRec(ch, type, date) {
    ch = ParseInt(ch);
    type = ParseInt(type);
    var channel = playbackVariables.mapMonth[ch],
        time = $("#calendar").commCal("getYearMonthStr", date);
    return channel !== undefined && channel[type] !== undefined ? channel[type][time] : undefined;
}

/**
 * 设置通道录像信息
 * @param {*} ch
 * @param {*} type
 * @param {*} date
 * @param {*} arrRec
 */
function setChannelMonthRec(ch, type, date, arrRec) {
    ch = ParseInt(ch);
    type = ParseInt(type);
    playbackVariables.mapMonth[ch] === undefined && (playbackVariables.mapMonth[ch] = new Array());
    playbackVariables.mapMonth[ch][type] === undefined && (playbackVariables.mapMonth[ch][type] = new Array());
    playbackVariables.mapMonth[ch][type][$("#calendar").commCal("getYearMonthStr", date)] = arrRec;
}

/**
 * 获取窗口播放录像信息
 * @param {*} wnd
 */
function getWindowDayRec(wnd) {
    wnd = ParseInt(wnd);
    return playbackVariables.arrayWindowRec[wnd];
}

/**
 * 设置窗口播放录像信息
 * @param {*} wnd
 * @param {*} dayRec
 * @param {*} type
 * @param {*} date
 */
function setWindowDayRec(wnd, dayRec, type, date) {
    wnd = ParseInt(wnd);
    playbackVariables.arrayWindowRec[wnd] = [dayRec, type, date];
}

/**
 * 搜索月份录像(如果没有缓存)和指定日期录像
 */
function searchFile(callback, bAutoSelRec) {
    var player = $('#videoBlock');
    var wnd = isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    //正在播放
    if (windowStatus.playing != 0) {
        $("#calendar").commCal("setSelDate", playbackVariables.lastWindowDate[wnd]);
        setSelectChannel(windowStatus.ch);
        $("#searchTypeList").val(getWindowDayRec(wnd)[1]);
        return rightPopup(lang.pb7);
    };
    if (isIE()) {
        var ch = getSelectChannel();
        if (!$.isNumeric(ch)) return rightPopup(lang.upgradeTips1);
        var cal = $("#calendar");
        var selDate = cal.commCal("getSelDate");
        var type = ParseInt($("#searchTypeList").val());
        var monthRec = getChannelMonthRec(ch, type, selDate);
        setWindowDayRec(wnd, [], type, selDate); // 先初始化为空数组
        playbackVariables.lastWindowDate[wnd] = selDate;
        clearTimeShaft();
        if (monthRec === undefined) {
            // 未搜索月份录像数据
            searchMonthRec(ch, type, selDate, wnd, function (arrRec) {
                // 获取月份数据期间窗口已改变则不需要高亮日历
                wnd == player.isPlayer('getCurrentWindow') && cal.commCal("hlDates", arrRec);
                if (arrRec.length > 0) {
                    if (bAutoSelRec) {
                        selDate = arrRec[arrRec.length - 1];
                        cal.commCal("setSelDate", selDate);
                    }
                    searchDayRec(ch, type, selDate, wnd, function (arrRec) {
                        refreshDayRec(wnd, arrRec, type, arrRec && arrRec.length > 0 ? new Date(arrRec[0].ulStartTime.replace(/-/g, "/")) : selDate);
                        callback && callback();
                    });
                } else {
                    setWindowDayRec(wnd, [], type, selDate);
                    refreshDayRec(wnd, [], type, selDate);
                    callback && callback();
                }
            });
        } else {
            cal.commCal("hlDates", monthRec).commCal("refresh");
            searchDayRec(ch, type, selDate, wnd, function (arrRec) {
                refreshDayRec(wnd, arrRec, type, arrRec && arrRec.length > 0 ? new Date(arrRec[0].ulStartTime.replace(/-/g, "/")) : selDate);
                callback && callback();
            });
        }
    } else {
        clearTimeShaft();
        var channel = getSelectChannel();
        if (!$.isNumeric(channel)) return rightPopup(lang.upgradeTips1);
        var year = parseInt($('.ui-datepicker-year  option:selected').val()),
            month = parseInt($('.ui-datepicker-month  option:selected').val());
        var startTime = getMonthBeginEnd(year, month).begin;
        var endTime = getMonthBeginEnd(year, month).end;
        var type = parseInt($('#searchTypeList option:selected').attr('num'));
        var param = {
            "channel": parseInt(channel),
            "streamNo": 0,
            "fileType": type,
            "startTime": String(startTime),
            "endTime": String(endTime)
        };
        api.queryDays(REQUEST_GET, param, function (code, data) {
            if (code != CODE_SUCCESS) return;
            if (data === '') return;
            var arrRec = getArrRec(data.days);
            setChannelMonthRec(channel, type, $('#calendar').commCal('getSelDate'), arrRec);
            $('#calendar').commCal("hlDates", arrRec);
            getHttpFileData(getSelectChannel(), $('#searchTypeList option:selected').attr('num'));
        });
    }
}

/**
 * 月份信息
 * @param {*} days 
 */
function getArrRec(days) {
    var year = parseInt($('.ui-datepicker-year  option:selected').val()),
        month = parseInt($('.ui-datepicker-month  option:selected').val());
    (month < 10) && (month = '0' + month);
    var array = [];
    for (var i = 0; i < days.length; i++) {
        (days[i] < 10) && (days[i] = '0' + days[i]);
        array.push(new Date(year, month, days[i]));
    };
    return array;
}

/**
 *
 * @returns 当前月的开始和结束时间戳
 */
function getMonthBeginEnd(year, month) {
    var result = { begin: 0, end: 0 };
    // 标准UTC时间
    var defDate = Date.UTC(year, month, 1, 0, 0, 0);
    var target = new Date(year, month + 1, 0);
    result.begin = defDate / 1000;
    var defDate1 = Date.UTC(year, month, target.getDate(), 23, 59, 59);
    result.end = defDate1 / 1000;
    return result;
}

/** 
 * HTTP获取文件
 * @param {*} channel
 * @param {*} type
 */
function getHttpFileData(channel, type) {
    var calendar = $('#calendar').commCal('getSelDate'),
        startTime = Date.UTC(calendar.getFullYear(), calendar.getMonth(), calendar.getDate(), 0, 0, 0) / 1000,
        endTime = Date.UTC(calendar.getFullYear(), calendar.getMonth(), calendar.getDate(), 23, 59, 59) / 1000;
    api.getRecordInfo(REQUEST_GET, {
        'channel': parseInt(channel),
        'streamNo': 0,
        'fileType': parseInt(type),
        'pageIndex': 0,
        'pageItems': 4000,
        'startTime': String(startTime),
        'endTime': String(endTime)
    }, function (code, data) {
        if (code != CODE_SUCCESS) return;
        var list = data.itemList,
            windowIndex = getConf('selectWindowIndex');
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                for (var key in list[i]) {
                    switch (key) {
                        case 'startTime':
                            var time = list[i].startTime;
                            list[i][key] = utc2local(new Date(time * 1000)).Format("yyyy-MM-dd hh:mm:ss");
                            break;
                        case 'endTime':
                            var time = list[i].endTime;
                            list[i][key] = utc2local(new Date(time * 1000)).Format("yyyy-MM-dd hh:mm:ss");
                            break;
                    }
                }
            };
            refreshDayRec(windowIndex, data.itemList, type, list[0].startTime);
            setWindowDayRec(windowIndex, list, type, calendar);
        } else {
            refreshDayRec(windowIndex, [], type, calendar);
        };
    });
}

/**
 * 在指定窗口播放录像文件
 * @param {int} wnd      默认为当前选中窗口
 * @param {int} playTime 播放时间戳, 默认为当前时间轴显示时间
 */
function setPlayBack(wnd, playTime) {
    if (getLocalServerWebsocketStatus()) { return alert(lang.noSupport14) };
    var player = $('#videoBlock');
    !wnd && (wnd = isIE() ? player.isPlayer('getCurrentWindow') : getWindowInfo(getConf('selectWindowIndex')).wnd);
    var dayRec = getWindowDayRec(wnd);
    if (dayRec === undefined) return rightPopup(lang.pb9);
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    switch (parseInt(windowStatus.playing)) {
        case 0:// 开始
            var selTime = playTime ? playTime : getTimeShaftTime();
            if (isIE()) {
                player.isPlayer('startPlayBack', wnd, selTime);
                enTimeShaftTimer(wnd, true);
            } else {
                var getTimeCallback = counter(1, function () {
                    var data = playbackVariables.fragmentTimeInfo;
                    if (!data) return rightPopup(lang.pb8);
                    var startTime = String(getUtc(data.startTime) / 1000),
                        endTime = String(getUtc(data.endTime) / 1000);
                    var callback = counter(1, function () {
                        player.isPlayer('startPlayBack', wnd, null, data, playbackVariables.fragmentVideoInfo, selTime / 1000, endTime);
                    });
                    getRecordEncodeInfo(data.channel, startTime, endTime, callback);
                });
                getFragmentTime(dayRec[0], selTime, getTimeCallback);
            }
            setWindowInfo(wnd, { 'playing': 1, 'ch': getSelectChannel() });
            break;
        case 1:// 暂停
            player.isPlayer('zoom', wnd).isPlayer('pausePlayBack', wnd);
            setWindowInfo(wnd, { 'playing': 2, 'ch': getSelectChannel() });
            enTimeShaftTimer(wnd, false);
            break;
        case 2: // 恢复播放
            var func = isIE() ? 'pausePlayBack' : 'resumePlayBack';
            player.isPlayer(func, wnd);
            setWindowInfo(wnd, { 'playing': 1, 'ch': getSelectChannel() });
            enTimeShaftTimer(wnd, true);
            break;
    }
    windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    refreshPlayStatus(windowStatus);
}

function getRecordEncodeInfo(channel, startTime, endTime, callback) {
    api.getRecordEncode(REQUEST_GET, {
        "channel": parseInt(channel),
        "streamNo": 0,
        "startTime": startTime,
        "endTime": endTime
    }, function (code, data) {
        if (code != CODE_SUCCESS) return;
        for (var key in data) {
            switch (key) {
                case 'videoEncodeType':
                    playbackVariables.fragmentVideoInfo[key] = VIDEO_CODEC[data[key].toLowerCase()];
                    break;
                case 'audioEncodeType':
                    playbackVariables.fragmentVideoInfo[key] = AUDIO_CODEC[data[key].toUpperCase()];
                    break;
                default:
                    playbackVariables.fragmentVideoInfo[key] = data[key];
                    break;
            }
        };
        callback && callback();
    });
}

function getFragmentTime(data, time, callback, isNext) {
    for (var i = 0; i < data.length; i++) {
        var sTime = getUtc(data[i].startTime),
            eTime = getUtc(data[i].endTime);
        if (isNext && time == eTime) {
            playbackVariables.fragmentTimeInfo = data[i + 1];
            break;
        };
        // 1.处于视频片段之间; 2.处于两个视频片段之间;
        if (!isNext && time >= sTime && time <= eTime) {
            playbackVariables.fragmentTimeInfo = data[i];
            break;
        };
    };
    callback && callback();
}

/**
 * 停止回放
 */
function setStopPlayBack(bResetTimeShaft) {
    window.shaftTimers && clearInterval(window.shaftTimers);
    var player = $('#videoBlock');
    wnd = isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    windowStatus.playing != 0 && player.isPlayer('stopPlayBack', wnd, true);
    wnd == player.isPlayer('getCurrentWindow') && enTimeShaftTimer(wnd, false);
    setWindowInfo(wnd, { 'playing': 0, 'sound': false });
    refreshPlayStatus();
    if (bResetTimeShaft) {
        // setWindowInfo(wnd, { 'zooming': false, 'recording': false });
        resetTimeShaft(wnd);
        setWindowInfo(wnd, { 'zooming': false, 'recording': false, 'pbSpeed': 0 });
    };
    $('#play').removeClass('active');
}

/**
 * 全屏
 */
function setFullscreen() {
    var player = $('#videoBlock');
    player.isPlayer('getPlayWindowNum') != 1 && player.isPlayer('setFullScreenMulti');
    player.isPlayer('setFullScreen');
}

/**
 * 开启声音
 */
function setSound() {
    var player = $('#videoBlock');
    if ($("#sound").hasClass("sound-btn-disable")) return;
    var wnd = isIE() ? player.isPlayer('getCurrentWindow') : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    if (!windowStatus.sound) {
        // 只允许一个窗口打开声音
        var wndNum = isIE() ? player.isPlayer('getPlayWindowNum') : playbackVariables.windowNum;
        for (var i = 0; i < wndNum; ++i) {
            var windowStatus1 = isIE() ? player.isPlayer('getWindowStatus', i) : getWindowInfo(i);
            if (i === wnd) continue;
            windowStatus1.sound && player.isPlayer('audioPlayback', i, !windowStatus1.sound);
            setWindowInfo(i, { 'sound': isIE() ? !windowStatus1.sound : false });
        };
    };
    setTimeout(function () {
        player.isPlayer('audioPlayback', wnd, !windowStatus.sound);
        var windowStatus2 = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
        playbackVariables.lastSoundWindow = windowStatus2.sound ? wnd : -1;
        setWindowInfo(wnd, { 'sound': !windowStatus2.sound });
        refreshPlayStatus(windowStatus2);
    }, 500);
}

/**
 * 电子放大
 */
function setZoom() {
    var player = $('#videoBlock');
    var wnd = isIE() ? player.isPlayer('getCurrentWindow') : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    if (windowStatus.playing == 0) return;
    var enable = !windowStatus.zooming;
    player.isPlayer('zoom', wnd, enable);
    setWindowInfo(wnd, { 'zooming': enable });
    refreshPlayStatus();
}

/**
 * 快进、慢退
 * @param {*} bFast 快进还是慢退
 * @param {*} noChangeSpeed 不需要改变速度，用于自动播放下一个片段时
 * @param {*} window 哪个窗口调速，如不传，则对选择的窗口进行调速，现在只有自动播放下一个片段调整速度时会传
 * @returns 
 */
function setSpeed(bFast, noChangeSpeed, window) {
    var player = $('#videoBlock');
    var wnd = window !== undefined ? window : isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    var currentWindowPlaybackSpeed = windowStatus.pbSpeed; // 基于当前窗口记录的回放速度进行调速

    if (bFast) {
        noChangeSpeed || currentWindowPlaybackSpeed++;
        if (currentWindowPlaybackSpeed > 3) return;
    } else {
        noChangeSpeed || currentWindowPlaybackSpeed--;
        if (currentWindowPlaybackSpeed < -3) return;
    }
    var setSpeedVal = currentWindowPlaybackSpeed; // 要设置成的速度

    if (windowStatus.playing != 1) return;
    if (windowStatus.pbSpeed == 0) {
        // 停止剪辑
        windowStatus.recording && player.isPlayer('clipsPlayBack', wnd);
        // 停止声音
        windowStatus.sound && player.isPlayer('audioPlayback', wnd, !windowStatus.sound);
        setWindowInfo(wnd, { 'sound': false, 'recording': false });
    };
    bFast ? player.isPlayer('setFastForwardPlayBack', wnd, setSpeedVal)
        : player.isPlayer('setSlowlyForwardPlayBack', wnd, setSpeedVal);
    windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    if (windowStatus.pbSpeed == 0 && wnd == playbackVariables.lastSoundWindow && !windowStatus.sound) {
        // 恢复声音
        player.isPlayer('audioPlayback', wnd, windowStatus.sound);
        setWindowInfo(wnd, { 'sound': windowStatus.sound });
        windowStatus = undefined;
    }
    setWindowInfo(wnd, { 'pbSpeed': setSpeedVal });
    refreshPlayStatus(windowStatus);
}

/**
 * 截图
 */
function setCapture() {
    var player = $('#videoBlock');
    var wnd = isIE() ? player.isPlayer('getCurrentWindow') : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    windowStatus.playing != 0 && player.isPlayer('capturePlayBack', wnd, getSelectChannel())
}

/**
 * 录像
 */
function setRecord() {
    var player = $('#videoBlock');
    if ($("#records").hasClass("records-btn")) return;
    var wnd = isIE() ? player.isPlayer('getCurrentWindow') : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    if (windowStatus.playing != 1) return;
    var enable = !windowStatus.recording;
    player.isPlayer('clipsPlayBack', wnd, enable, getSelectChannel());
    setWindowInfo(wnd, { 'recording': enable });
    refreshPlayStatus();
}

/**
 * 设置缩放的显示状态
 * @param {[type]} bEnabled  是否开启状态
 * @param {[type]} bDisabled 是否禁用, 默认开启
 */
function setZoomSta(bEnabled, bDisabled) {
    if (bDisabled) {
        $("#zoom").removeClass("open-zoom").removeClass("close-zoom").addClass("zoom-btn-disable").attr("title", lang.startzoom);
    } else if (bEnabled) {
        $("#zoom").removeClass("close-zoom").removeClass("zoom-btn-disable").addClass("open-zoom").attr("title", lang.stopzoom);
    } else {
        $("#zoom").removeClass("open-zoom").removeClass("zoom-btn-disable").addClass("close-zoom").attr("title", lang.startzoom);
    }
}

/**
 * 设置语音功能的显示状态
 * @param {bool} bEnabled
 * @param {bool} bDisabled
 */
function setSoundSta(bEnabled, bDisabled) {
    if (bDisabled) {
        $("#sound").removeClass("open-sound close-sound").addClass("sound-btn-disable").attr("title", lang.closesound);
    } else if (bEnabled) {
        $("#sound").removeClass("close-sound sound-btn-disable").addClass("open-sound").attr("title", lang.opensound);
    } else {
        $("#sound").removeClass("open-sound sound-btn-disable").addClass("close-sound").attr("title", lang.closesound);
    }
}

/**
 * 设置快进快退的显示状态
 * @param {bool} bEnabled
 */
function setPlaySpSta(bEnabled) {
    if (bEnabled) {
        $("#fast").removeClass("fast-btn").addClass("fast").attr("title", lang.pb12);
        $("#slow").removeClass("slow-btn").addClass("slow").attr("title", lang.pb13);
    } else {
        $("#fast").removeClass("fast").addClass("fast-btn").attr("title", "");
        $("#slow").removeClass("slow").addClass("slow-btn").attr("title", "");
    }
}

/**
 * 设置录像录制的显示状态
 * @param {bool} bEnabled null表示不改变状态
 * @param {bool} bDisabled 是否禁用
 */
function setPlayRecordSta(bEnabled, bDisabled) {
    if (bEnabled !== null) {
        if (bEnabled) {
            $("#records").removeClass("close-record").addClass("open-record");
        } else {
            $("#records").removeClass("open-record").addClass("close-record");
        }
    }
    if (bDisabled) {
        $("#records").removeClass("close-record open-record").addClass("records-btn");
    } else {
        $("#records").removeClass("records-btn");
    }
}

/**
 * 设置录像截图显示状态
 * @param {bool} bEnabled
 */
function setPlayCapSta(bEnabled) {
    if (bEnabled) {
        $("#capture").addClass("open-capture");
    } else {
        $("#capture").removeClass("open-capture");
    }
}

/**
 * 设置录像停止按钮的显示状态
 * @param {bool} bEnabled
 */
function setPlayStopSta(bEnabled) {
    if (bEnabled) {
        $("#stop").removeClass("stop-btn").addClass("stop");
    } else {
        $("#stop").removeClass("stop").addClass("stop-btn");
    }
}

/**
 * 设置录像播放按钮的显示状态
 * @param {bool} bEnabled true == 停止状态, false == 播放状态
 */
function setPlayStatus(bEnabled) {
    if (bEnabled) {
        $("#play").removeClass("active").attr("title", lang.play);
    } else {
        $("#play").addClass("active").attr('title', lang.pauseing);
    }
}

/**
 * 设置快进显示文本
 * @param {int} speed
 */
function setSpeedTxt(speed) {
    if (speed === null) return $("#nowStatues").html("");
    speed = ParseInt(speed);
    switch (speed) {
        case -3:
            speed = "1/8";
            break;
        case -2:
            speed = "1/4";
            break;
        case -1:
            speed = "1/2";
            break;
        case 0:
            speed = "1";
            break;
        case 1:
            speed = "2";
            break;
        case 2:
            speed = "4";
            break;
        case 3:
            speed = "8";
            break;
    }
    $("#nowStatues").html(speed + lang.pb10);
}

/**
 * 打开录像下载页面
 * @return {void}
 */
function setDownload() {
    var player = $('#videoBlock');
    var wnd = isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var ch = isIE() ? player.isPlayer('getWindowStatus', wnd).ch : getSelectChannel();
    if (ch == -1) return rightPopup(lang.upgradeTips1);
    if (!nFileBackupDatabit[ch]) return rightPopup(lang.nolimit);
    var arrRec = getWindowDayRec(wnd);
    if (arrRec === undefined) return rightPopup(lang.pb9);
    if (arrRec.length === 0) return rightPopup(lang.pb8);
    if (playbackVariables.windowDownload && !playbackVariables.windowDownload.closed) return playbackVariables.windowDownload.focus();
    var windowRec = getWindowDayRec(wnd);
    dlPagePrm = {
        "m_devicetype": getDevConf('deviceType'),
        "m_nDeviceTypeDay": ParseInt(getDevConf('recordDayNum')),
        "nDeviceDay": nDeviceDay,
        "nDeviceYear": nDeviceYear,
        "nDeviceMonth": nDeviceMonth,
        "nDeviceDay": nDeviceDay,
        "ip": getHost(),
        "tcpport": getTcpPort(),
        "rstpport": getRstpPort(),
        "loginUser": getUserName(),
        "loginpsw": getAuth(),
        "channelNum": getTotalChannelNum(),
        "versionconfig": versionconfig,
        "m_bDVR": m_bDVR,
        "m_SelChannel": ch,
        "nFileBackupDatabit": playbackVariables.fileBackupDatabit,
        "devTz": getConf("devTz"),
        "devDst": getConf("devDst"),
        // "monthRec": $.map(getChannelMonthRec(ch, windowRec[1], windowRec[2]), function (d) { return d.getTime(); }),
        "dayRec": windowRec,
        "isSmt": getConf("isSmartDetectEn") ? true : false,
        "isXvrSearchType": getConf("isXvrSearchType") ? true : false,
        "isNvrAlarmInEn": getConf("isNvrAlarmInEn") ? true : false,
        "isXvrNoMotionAlarmType": getConf("isXvrNoMotionAlarmType") ? true : false,
        "isXVRSmtCmp": getConf("isXvrLink") ? true : false,
        "isCPUMC6630": getConf("isCPUMC6630"),
        "isCPUMC6650": getConf("isCPUMC6650"),
    };
    playbackVariables.windowDownload = window.open(
        "/views/playback/download.html?ver=" + (new Date()).getTime(), 'Download', 'height=600, width=1200, top=250, left=300, toolbar=no, menubar=no, ' +
    'scrollbars=yes, resizable=no, location=no, status=no'
    );
}

/**
 * 获取当前左侧通道列表选中的通道下标
 * @return {int}
 */
function getSelectChannel() {
    return $(".J-channel-list>li.select").attr("value");
}

/**
 * 高亮左侧选中的通道列表
 * @param {int} ch
 */
function setSelectChannel(ch) {
    $(".J-channel-list>li").filter(".select").removeClass("select").end().filter("[value='" + ch + "']").addClass("select");
}

/**
 * 清除时间轴
 */
function clearTimeShaft() {
    if (playbackVariables.timeShaft) {
        playbackVariables.timeShaft.L(0);
        playbackVariables.timeShaft.P();
    };
}

/**
 * 获取时间轴时间
 */
function getTimeShaftTime() {
    var time = new Date(Date.parse(playbackVariables.timeShaft.j.ST().replace(/\-/g, '/')));
    // 使用UTC时间戳(毫秒级)
    utc = Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
    return utc;
}

/**
 * 初始化时间轴中间线并重新绘制时间轴
 * @param {*} wnd
 * @param {*} bEnable
 */
function enTimeShaftTimer(wnd, bEnable) {
    window.shaftTimers && clearInterval(window.shaftTimers);
    wnd = ParseInt(wnd);
    var shaftTimer = function () {
        // 拖动时间轴中
        if (playbackVariables.timeShaft.r) return;
        // 更新时间轴时间与光标(0时区) 
        var time = $('#videoBlock').isPlayer('getPlayBackCurrentTime', wnd);
        if (isIE() && playbackVariables.lastTime !== time && time > 8 * 3600000) {
            playbackVariables.lastTime = time;
            var date = new Date(time * 1000);
            playbackVariables.timeShaft.M(utc2local(date).Format("yyyy-MM-dd hh:mm:ss"));
            playbackVariables.lastWindowDate[wnd] = utc2local(date);
        };
    };
    if (bEnable) {
        window.shaftTimers = setInterval(shaftTimer, 1000);
        shaftTimer();
    } else {
        // 先手动更新一次
        playbackVariables.lastWindowDate[wnd] && playbackVariables.timeShaft.M(new Date(playbackVariables.lastWindowDate[wnd]).Format("yyyy-MM-dd hh:mm:ss"));
    }
}

/**
 * 根据录像文件数据绘制时间轴
 * @param {int} wnd      窗口下标
 * @param {array} fileList 录像文件列表
 * @param {int} fileType 文件类型
 * @param {date} defDate  文件列表为空时的初始化时间轴位置
 * @param {date} specDate  可选, 文件存在时, 指定当前时间轴位置
 */
function setTimeShaft(wnd, fileList, fileType, defDate, specDate) {
    var player = $('#videoBlock'), startTimeLabel = "ulStartTime", stopTimeLabel = "ulStopTime", videoType = VIDEO_TYPE;
    if (isIE()) {
        if (wnd != player.isPlayer('getCurrentWindow')) return;
    } else {
        startTimeLabel = "startTime";
        stopTimeLabel = "endTime";
        videoType = VIDEO_TYPE_LIST;
    }
    clearTimeShaft();
    fileType = ParseInt(fileType);
    playbackVariables.timeShaft.COLOR(videoType[fileType]);
    for (var i = 0; i < fileList.length; i++) {
        var sTime = fileList[i][startTimeLabel], eTime = fileList[i][stopTimeLabel];
        if (fileList[i][startTimeLabel].indexOf('-') < 0) {
            sTime = new Date(fileList[i][startTimeLabel] * 1000).Format("yyyy-MM-dd hh:mm:ss");
            eTime = new Date(fileList[i][stopTimeLabel] * 1000).Format("yyyy-MM-dd hh:mm:ss");
        };
        playbackVariables.timeShaft.F(sTime, eTime, fileType);
    }
    if (fileList.length > 0) {
        var firstTime = new Date(fileList[0][startTimeLabel] * 1000).Format("yyyy-MM-dd hh:mm:ss");
        time = fileList[0][startTimeLabel].indexOf('-') < 0 ? firstTime : fileList[0][startTimeLabel];
        playbackVariables.timeShaft.M(specDate ? specDate.Format("yyyy-MM-dd hh:mm:ss") : time);
    } else {
        playbackVariables.timeShaft.M(defDate.Format("yyyy-MM-dd hh:mm:ss"));
    }
}

/**
 * 拖动时间轴鼠标弹起
 */
function playMouseUp() {
    var player = $('#videoBlock');
    var wnd = isIE() ? ParseInt(player.isPlayer('getCurrentWindow')) : getConf('selectWindowIndex');
    var windowStatus = isIE() ? player.isPlayer('getWindowStatus', wnd) : getWindowInfo(wnd);
    var date = utc2local(new Date(getTimeShaftTime())), utc = getTimeShaftTime();
    var lastDate = playbackVariables.lastWindowDate[wnd];
    playbackVariables.lastWindowDate[wnd] = new Date(Date.parse(playbackVariables.timeShaft.j.ST().replace(/\-/g, '/')));
    windowStatus.pbSpeed = playbackVariables.speed = 0
    setStopPlayBack();
    if (lastDate.getDate() !== date.getDate()) {
        playbackVariables.channelByTimeShaft = true;
        $("#calendar").commCal("setSelDate", utc);
        searchFile(function () {
            playbackVariables.channelByTimeShaft = false;
            windowStatus.playing == 1 && setPlayBack(wnd, utc);
        });
    } else {
        if (playbackVariables.ieTriggerStop || windowStatus.playing == 1 || (!isIE() && windowStatus.playing == 0)) {
            var result = checkPlaybackInfo(wnd, date);
            if (!result) return;
            setWindowInfo(wnd, { 'playing': 0 });
            setPlayBack(wnd, utc);
        };
    }
}

/**
 * 放大
 */
function zoomExpand() {
    playbackVariables.shaftZoomSize++;
    if (playbackVariables.shaftZoomSize > 12) return playbackVariables.shaftZoomSize = 12;
    try {
        playbackVariables.timeShaft.S(playbackVariables.shaftZoomSize);
    } catch (e) { }
}

/**
 * 缩小
 */
function zoomNarrow() {
    playbackVariables.shaftZoomSize--;
    if (playbackVariables.shaftZoomSize < 6) return playbackVariables.shaftZoomSize = 6;
    try {
        playbackVariables.timeShaft.S(playbackVariables.shaftZoomSize);
    } catch (e) { }
}

/**
 * 重置对应窗口的录像时间轴状态到当天的录像开头
 * @param  {int} wnd 录像下标
 * @return {void}
 */
function resetTimeShaft(wnd) {
    var player = $('#videoBlock');
    wnd === undefined && (wnd = ParseInt(player.isPlayer('getCurrentWindow')));
    var dayRec = getWindowDayRec(wnd);
    if (!dayRec || dayRec.length === 0) return;
    var time = isIE() ? dayRec[0][0].ulStartTime : dayRec[0][0].startTime;
    refreshDayRec(wnd, dayRec[0], dayRec[1], dayRec[0].length > 0 ? new Date(time.replace(/-/g, "/")) : dayRec[2]);
}

/**
 * 设置窗口信息
 * @param {*} window
 */
function setWindowInfo(window, data) {
    if (window == null) {
        for (var i = 0; i < getTotalChannelNum(); i++) {
            playbackVariables.windowInfo[i] = {
                'playing': 0,
                'sound': false,
                'pbSpeed': 0,
                'zooming': false,
                'ch': -1,
                'wnd': i,
                'recording': false,
            };
        };
    } else {
        for (var key in data) playbackVariables.windowInfo[window][key] = data[key];
    };
}

/**
 * 获取窗口信息
 * @param {*} window
 */
function getWindowInfo(window) {
    return playbackVariables.windowInfo[window];
}

/**
 * 片段播放结束
 * @param {*} time
 */
function onPlaybackFileEnd(time, wnd) {
    var data = getWindowDayRec(wnd)[0];
    window.shaftTimers && clearInterval(window.shaftTimers);
    getFragmentTime(data, time * 1000, function () {
        nextPlayback(wnd);
    }, true);
}

/**
 * 下个片段
 * @param {*} window
 */
function nextPlayback(window) {
    var data = playbackVariables.fragmentTimeInfo, player = $('#videoBlock');
    player.isPlayer('stopPlayBack', window);
    if (!data) return rightPopup(lang.pb8);
    var startTime = String(getUtc(data.startTime) / 1000),
        endTime = String(getUtc(data.endTime) / 1000);
    var callback = counter(1, function () {
        player.isPlayer('startPlayBack', window, null, data, playbackVariables.fragmentVideoInfo, startTime, endTime);
        setTimeout(function () {
            if (getWindowInfo(window).pbSpeed !== 0) { // 当前速度没有调成倍速则无需同步速度
                setSpeed(getWindowInfo(window).pbSpeed > 0, true, window);
            }
        }, 500);
        setTimeout(function () { getWindowInfo(window).sound && player.isPlayer('audioPlayback', window, true); }, 500);
    });
    getRecordEncodeInfo(data.channel, startTime, endTime, callback);
}

// 中间件回调
/**
 * 创建窗口成功后执行
 */
function onImplement() {
    $(document).attr('title', lang.playback);
    searchFile();
}

function setSdk() {
    loading(false);
}

function onRecord() { }

function onStartPlayBack(code, wnd) {
    if (code != CODE_SUCCESS) return;
    var window = getConf('selectWindowIndex');
    var enable = getWindowInfo(window).playing == 1 ? true : false;
    enTimeShaftTimer(window, enable);
}

function onOSDTime(time) {
    var window = getConf('selectWindowIndex') ? getConf('selectWindowIndex') : 0;
    if (!time) return;
    playbackVariables.lastTime = time;
    var date = isIE() ? new Date(time * 1000) : utc2local(new Date(time * 1000));
    playbackVariables.timeShaft.M(date.Format("yyyy-MM-dd hh:mm:ss"));
    playbackVariables.lastWindowDate[window] = date;
}

function onOpenSound(code) {
    if (code != CODE_SUCCESS) {
        setSoundSta(false, false);
        setWindowInfo(getConf('selectWindowIndex'), { 'sound': false });
    };
}

function getPlaybackChannelList() {
    var num = getTotalChannelNum(),
        list = []
    for (var i = 0; i < num; i++) {
        nPlaybackDatabit[i] && list.push(i);
    };
    return list;
}

function checkPlaybackInfo(wnd, t) {
    var list = getWindowDayRec(wnd);
    if (list == undefined) return rightPopup(lang.pb9);
    var array = list[0],
        time = t.getTime() / 1000,
        fileInfo = false,
        startLabel = 'startTime',
        endLabel = 'endTime';
    if (isIE()) {
        startLabel = 'ulStartTime';
        endLabel = 'ulStopTime';
    };
    for (var i = 0; i < array.length; i++) {
        var startTime = date2sec(array[i][startLabel]),
            endTime = date2sec(array[i][endLabel]);
        if (time >= startTime && time < endTime) {
            fileInfo = true;
            playbackVariables.ieTriggerStop = false;
            break;
        };
    };
    playbackVariables.ieTriggerStop = true;
    return fileInfo;
}