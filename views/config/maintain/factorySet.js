var factorySetVariables = {
    //私有变量
};

function onLoad() {
    initDot();
    setTitle(lang.optiondefault);
}
// 以下旧代码，要优化

/**
 * 根据配置生成保存用参数
 * @param  {array} $opt
 * @return {string}
 */
function getDataBit($opt) {
    var nvrOrder = [
        "SDK_PARAM_MASK_ENCODE", //bit.0: 编码参数
        "SDK_PARAM_MASK_CHNNAME", //通道名称 通道名字
        "SDK_PARAM_MASK_NET", //网络设置
        "SDK_PARAM_MASK_DDNS", //ddns设置
        "SDK_PARAM_MASK_EMAIL", //邮件设置
        "SDK_PARAM_MASK_FTP", //FTP
        "SDK_PARAM_MASK_UPNP", //upnp
        "SDK_PARAM_MASK_PPPOE", //PPPOE
        "SDK_PARAM_MASK_CLOUDSTORAGE", //云储存
        "SDK_PARAM_MASK_MOTION", //移动侦测
        "SDK_PARAM_MASK_EVENT", //事件报警 无硬盘磁盘错误，IP冲突 断网
        "SDK_PARAM_MASK_RECORD", //录像设置
        "SDK_PARAM_MASK_COMM", //常规设置 机器上对应的为设备设置，
        "SDK_PARAM_MASK_NTP", //与日期设置
        "SDK_PARAM_MASK_DISPLAY", //显示设置
        "SDK_PARAM_MASK_DISCOLR", //色彩校正设置  vga hdmi
        "SDK_PARAM_MASK_USER", //用户设置 组设置
        "SDK_PARAM_MASK_AUTOMATIC", //自动维护
        "SDK_PARAM_MASK_CHANNEL", //通道设置  //hvr
        "SDK_PARAM_MASK_PTZ", //PTZ参数 针对ahd球机参数
        "SDK_PARAM_MASK_POLL", //通道画面自动轮巡参数
        "SDK_PARAM_MASK_TOUR", //巡航线设置好的巡航线
        "SDK_PARAM_MASK_IMAGE_ATTR", //图像颜色 色彩调节
        "SDK_PARAM_MASK_SUMMERTIME",
        "SDK_PARAM_MASK_PREVIEW", //预览设置
        "SDK_PARAM_MASK_ALARM_IN", //外部报警输入参数
        "SDK_PARAM_MASK_SERIAL", //XXXXXX串口参数
        "SDK_PARAM_MASK_OVERLAY", //XXXXXX遮挡区域参数
        "SDK_PARAM_MASK_OSD", //XXXXXXosd参数
        "SDK_PARAM_MASK_HIDE", //XXXXXX视频遮挡侦测参数
        "SDK_PARAM_MASK_VIDEO_LOST", //XXXXXX视频丢失参数
        "SDK_PARAM_MASK_TV", //XXXXXX边距调节参数
        "SDK_PARAM_MASK_RECORD_STATE", //预录时间
        "SDK_PARAM_MASK_SERVPORT",  //
        "SDK_PARAM_MASK_ALARM_OUT",  //报警输出
        "SDK_PARAM_MASK_IPEYE",  // ipeye
        "SDK_PARAM_MASK_SYSTIME_PARAM",
        "SDK_PARAM_MASK_AUDIO",
        "SDK_PARAM_MASK_BUIT"
    ];
    var xvrOrder = [
        "SDK_PARAM_MASK_ENCODE",
        "SDK_PARAM_MASK_CHNNAME",      //通道名称 通道名字
        "SDK_PARAM_MASK_NET",        //网络设置
        "SDK_PARAM_MASK_DDNS",      //ddns设置
        "SDK_PARAM_MASK_EMAIL",      //email
        "SDK_PARAM_MASK_FTP",       //FTP
        "SDK_PARAM_MASK_UPNP",      //upnp
        "SDK_PARAM_MASK_PPPOE",  //PPPOE
        "SDK_PARAM_MASK_CLOUDSTORAGE", //云储存
        "SDK_PARAM_MASK_MOTION",     //移动侦测
        "SDK_PARAM_MASK_EVENT",   //事件报警 无硬盘磁盘错误，IP冲突 断网
        "SDK_PARAM_MASK_VIDEO_LOST",
        "SDK_PARAM_MASK_ALARM_IN",
        "SDK_PARAM_MASK_RECORD",    //录像设置
        "SDK_PARAM_MASK_COMM",    //常规设置 机器上对应的为设备设置，
        "SDK_PARAM_MASK_NTP",    //与日期设置
        "SDK_PARAM_MASK_DISPLAY",     //显示设置
        "SDK_PARAM_MASK_DISCOLR",    //色彩校正设置  vga, hdmi
        "SDK_PARAM_MASK_USER",   //用户设置 组设置
        "SDK_PARAM_MASK_AUTOMATIC",   //自动维护
        "SDK_PARAM_MASK_CHANNEL",   //通道设置  //hvr
        "SDK_PARAM_MASK_PTZ",     //PTZ参数, 针对ahd球机参数
        "SDK_PARAM_MASK_POLL",    //通道画面自动轮巡参数
        "SDK_PARAM_MASK_TOUR",   //巡航线设置好的巡航线
        "SDK_PARAM_MASK_IMAGE_ATTR",   //图像颜色 色彩调节
        "SDK_PARAM_MASK_PREVIEW",   //预览设置
        "SDK_PARAM_MASK_SERIAL",       //XXXXXX串口参数
        "SDK_PARAM_MASK_OVERLAY",    //XXXXXX遮挡区域参数
        "SDK_PARAM_MASK_OSD",      //XXXXXXosd参数
        "SDK_PARAM_MASK_HIDE",     //XXXXXX视频遮挡侦测参数
        "SDK_PARAM_MASK_TV",      //XXXXXX边距调节参数
        "SDK_PARAM_MASK_SUMMERTIME",    //夏令时
        "SDK_PARAM_MASK_CHECKTIME",  //通道对时
        "SDK_PARAM_MASK_ADDCAMERA",
        "SDK_PARAM_MASK_RECORD_STATE",   //预录设置
        "SDK_PARAM_MASK_HUMAN",
        "SDK_PARAM_MASK_ALARM_OUT",
        "SDK_PARAM_MASK_NET_FILTER",
        "SDK_PARAM_MASK_IPEYE",
        "SDK_PARAM_MASK_SYSTIME_PARAM",
        "SDK_PARAM_MASK_BUIT"
    ];
    var dataBit = "";
    if (isXVR()) {
        for (var key in xvrOrder) {
            dataBit += (($opt[xvrOrder[key]] ? "1" : "0") + ";");
        }
    } else {
        for (var key in nvrOrder) {
            dataBit += (($opt[nvrOrder[key]] ? "1" : "0") + ";");
        }
    }
    return dataBit;
}

function default_record() {
    if (!confirm(lang.recorddefault)) return;
    var str = "";
    var defOpt = getDevDefOpt();
    if (defOpt) {
        defOpt["SDK_PARAM_MASK_RECORD"] = "1";
        defOpt["SDK_PARAM_MASK_RECORD_STATE"] = "1";
        str = getDataBit(defOpt);
    }
    var defaultItemList = isXVR() ? [13, 34] : [11, 32];
    api.default(REQUEST_SET, { "channel": 250, "defaultItemList": defaultItemList }, function (code) {
        if (code != CODE_SUCCESS) return;
        rightPopup(lang.saved);
    });
};


function default_channel() {
    var bPoE = window.top.isPoeEnable();
    if (!confirm(bPoE ? lang.chanelconfgreboot : lang.cameradefault)) return;
    var str = "";
    var defOpt = getDevDefOpt();

    if (defOpt) {
        defOpt["SDK_PARAM_MASK_IMAGE_ATTR"] = "1";
        defOpt["SDK_PARAM_MASK_PTZ"] = "1";
        defOpt["SDK_PARAM_MASK_CHNNAME"] = "1";
        defOpt["SDK_PARAM_MASK_CHANNEL"] = "1";
        defOpt["SDK_PARAM_MASK_AUDIO"] = "1";
        str = getDataBit(defOpt);
    } else {
        defOpt = {};
        defOpt["SDK_PARAM_MASK_IMAGE_ATTR"] = "1";
        defOpt["SDK_PARAM_MASK_PTZ"] = "1";
        defOpt["SDK_PARAM_MASK_CHNNAME"] = "1";
        defOpt["SDK_PARAM_MASK_ADDCAMERA"] = "1";
        str = getDataBit(defOpt);
    }
    var defaultItemList = isXVR() ? [1, 21, 24, 33] : [1, 20, 21, 24, 18];
    api.default(REQUEST_SET, { "channel": 250, "defaultItemList": defaultItemList }, function (code) {
        if (code != CODE_SUCCESS) return;
        bPoE ? window.top.doRestartCount(0) : rightPopup(lang.saved);
    });
}


function default_system() {
    if (!confirm(lang.systemdefault)) return;
    var str = "";
    var defOpt = getDevDefOpt();
    if (defOpt) {
        defOpt["SDK_PARAM_MASK_COMM"] = "1";
        defOpt["SDK_PARAM_MASK_NTP"] = "1";
        defOpt["SDK_PARAM_MASK_SYSTIME_PARAM"] = "1";
        defOpt["SDK_PARAM_MASK_NET"] = "1";
        defOpt["SDK_PARAM_MASK_DDNS"] = "1";
        defOpt["SDK_PARAM_MASK_EMAIL"] = "1";
        defOpt["SDK_PARAM_MASK_FTP"] = "1";
        defOpt["SDK_PARAM_MASK_UPNP"] = "1";
        defOpt["SDK_PARAM_MASK_PPPOE"] = "1";
        defOpt["SDK_PARAM_MASK_CLOUDSTORAGE"] = "1";

        defOpt["SDK_PARAM_MASK_MOTION"] = "1";
        defOpt["SDK_PARAM_MASK_VIDEO_LOST"] = "1";

        defOpt["SDK_PARAM_MASK_DISPLAY"] = "1";
        defOpt["SDK_PARAM_MASK_DISCOLR"] = "1";
        defOpt["SDK_PARAM_MASK_EVENT"] = "1";
        defOpt["SDK_PARAM_MASK_USER"] = "1";
        defOpt["SDK_PARAM_MASK_ALARM_IN"] = "1";
        defOpt["SDK_PARAM_MASK_ALARM_OUT"] = "1";
        defOpt["SDK_PARAM_MASK_NET_FILTER"] = "1";
        defOpt["SDK_PARAM_MASK_IPEYE"] = "1";
        str = getDataBit(defOpt);
    } else {
        defOpt = {};
        defOpt["SDK_PARAM_MASK_COMM"] = "1";
        defOpt["SDK_PARAM_MASK_NTP"] = "1";
        defOpt["SDK_PARAM_MASK_SYSTIME_PARAM"] = "1";
        defOpt["SDK_PARAM_MASK_NET"] = "1";
        defOpt["SDK_PARAM_MASK_DDNS"] = "1";
        defOpt["SDK_PARAM_MASK_EMAIL"] = "1";
        defOpt["SDK_PARAM_MASK_FTP"] = "1";
        defOpt["SDK_PARAM_MASK_UPNP"] = "1";
        defOpt["SDK_PARAM_MASK_CLOUDSTORAGE"] = "1";
        defOpt["SDK_PARAM_MASK_CHANNEL"] = "1";
        defOpt["SDK_PARAM_MASK_MOTION"] = "1";
        defOpt["SDK_PARAM_MASK_VIDEO_LOST"] = "1";

        defOpt["SDK_PARAM_MASK_DISPLAY"] = "1";
        defOpt["SDK_PARAM_MASK_DISCOLR"] = "1";

        defOpt["SDK_PARAM_MASK_EVENT"] = "1";

        defOpt["SDK_PARAM_MASK_USER"] = "1";
        defOpt["SDK_PARAM_MASK_ALARM_IN"] = "1";
        defOpt["SDK_PARAM_MASK_ALARM_OUT"] = "1";
        defOpt["SDK_PARAM_MASK_NET_FILTER"] = "1";
        defOpt["SDK_PARAM_MASK_IPEYE"] = "1";
        str = getDataBit(defOpt);
    }
    var defaultItemList = isXVR() ? [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 35, 36, 37, 38, 39] :
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 36, 37, 38, 39];
    api.default(REQUEST_SET, { "channel": 250, "defaultItemList": defaultItemList }, function (code) {
        if (code != CODE_SUCCESS) return;
        rightPopup(lang.saved);
    });

    if (getDevConf('defaultIp')) {
        window.top.ip = getDevConf('defaultIp');
    } else {
        window.top.ip = "192.168.1.88";
    }
    window.top.port = "80";
    window.top.doRestartCount(0);
    return;
}


function default_syemaintain() {
    if (!confirm(lang.sysmaitiandefault)) return;
    var str = "";
    var defOpt = {};
    if (defOpt) {
        defOpt["SDK_PARAM_MASK_AUTOMATIC"] = "1";
        str = getDataBit(defOpt);
    }
    var defaultItemList = isXVR() ? [19] : [17]
    api.default(REQUEST_SET, { "channel": 250, "defaultItemList": defaultItemList }, function (code) {
        if (code != CODE_SUCCESS) return;
        rightPopup(lang.saved);
    });
}

function default_save() {
    if ($("#chdefault_factory").is(":checked")) {

        if (!confirm(lang.reset)) return;
        api.default(REQUEST_SET, { "channel": 250, "defaultItemList": [128] }, function (code) {
            if (code != CODE_SUCCESS) return;
            rightPopup(lang.saved);
        });
        window.top.ip = getDevConf('defaultIp') ? getDevConf('defaultIp') : "192.168.1.88";
        window.top.port = "80";
        window.top.doRestartCount(0);
        return;
    }
}
//XVR除了admin以外的用户无权限恢复出厂设置
function checkboxfuntion() {
    if (isXVR()) {
        help = window_parent.nSynConfigDatabit[22];
        if (!help) {
            rightPopup(lang.nolimit);
            $("#chdefault_factory").prop("checked", false);
        }
    }
}

/**
 * 获取设备的默认配置, 默认为关闭
 * @return {array}
 */
function getDevDefOpt() {
    if (isNVR()) return {};

    // 暂时只有NVR需要重构
    return false;
}