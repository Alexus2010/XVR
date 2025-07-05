var imageVariables = {
    // 控制滚动条值改变之后不要再次调用保存接口
    inited: false,
    channelnum: getTotalChannelNum(),
    wsId: 0,
};

function onLoad() {
    initDot();
    setTitle(lang.img);
    $('#videoBlock').isPlayer({
        isConfigVideo: true
    });

    initImage(initImgNext);

    // 调整宽度以适应不同语言长度
    if (getLang() != 'cn') {
        $('.J-img-tab').css('min-width', '410px');
        $('.slide-title').css('min-width', '102px');
        $('.width90').css('min-width', '120px');
    }

    !isXVR() && $(".J-xvr-eq").hide();
}

/**
 * 初始化图像
 * @param {function} initCb 回调
 */
function initImage(initCb) {
    var channelList = $(".J-img-channel");

    if (isXVR()) {
        getDeviceCapablities(function () {
            getChannelList(null, function (channelArr) {
                initChannelSelect(channelList, imageVariables.channelnum, function (channelIndex) {
                    return (vChannelConfig[channelIndex] === 0 && channelArr[channelIndex].enable) || vChannelConfig[channelIndex] === 1;
                });
                initCb();
            });
        });
    } else {
        getChannelProtocolType(function (channelArr) {
            initChannelSelect(channelList, imageVariables.channelnum, function (channelIndex) {
                return channelArr[channelIndex].enable;
            });
            initCb();
        });
    }
}

function setSlider() {
    $(".J-img-adjust+div").find("[slider]").each(function (i) {
        var $this = $(this);
        var $ipt = $this.siblings('input');
        $this.slider({
            min: $ipt.attr("min"), max: $ipt.attr("max"), value: $ipt.val(), slide: function (evt, ui) {
                $ipt.val(ui.value);
            }, change: function (evt, ui) {
                if (!imageVariables.inited) return;
                $ipt.val(ui.value);
                imageConfigSave();
            }
        });
    });
}

/**
 *  初始化图像控件
 */
function initImgNext() {
    var channelList = $(".J-img-channel");
    if (!channelList.val()) { return rightPopup(lang.nolimit); }

    $(".J-control-setting").removeClass("hide").addClass("inline-block").position({
        of: $("#videoBlock"), at: "right top", my: "left top"
    });
    $(".J-img-tab").accordion({
        heightStyle: "content", animate: false
    });

    // 图像调节
    var $blk = $(".J-img-adjust+div");
    setEditNumberStyle($blk.find("input.mini-input"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });
    setSlider();
    $(".J-btn-default").click(onImageRestore);

    // 补光
    $blk = $(".J-light-balance+div");
    $blk.find("[slider]").slider({
        min: 0, max: 100, value: 0,
        slide: function (evt, ui) {
            $("#iptHisiLighting").val(ui.value);
        }, change: function (evt, ui) {
            if (!imageVariables.inited) return;
            $("#iptHisiLighting").val(ui.value);
            imageConfigSave();
        }
    });

    setEditNumberStyle($("#iptHisiLighting"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });

    initFillLightTime();

    $("#selLBModeHi").on("change", function () {

        if ($(".J-img-tab .hisi").length === 0) return;
        var selVal = $(this).val();

        // 补光模式白天不能调灵敏度、时间、亮度，黑夜只支持调亮度
        if (selVal == "1" || selVal == "2") {
            $(".J-fillLight-sensitivity, .J-fillLight-filtrationTime, #iptHisiLighting").prop("disabled", true);
            $("[slider='ghssmartiruclightval']").slider("disable");
            selVal == "2" ? $("[slider='ghssmartiruclightval']").slider("enable") && $("#iptHisiLighting").prop("disabled", false) : '';
        } else {
            $(".J-fillLight-sensitivity, .J-fillLight-filtrationTime, #iptHisiLighting").prop("disabled", false);
            $("[slider='ghssmartiruclightval']").slider("enable");
        }

        if (selVal == "3") {
            // 定时模式显示时间段编辑
            $(".J-light-balance+div .J-timing").show();
            $(".J-light-balance+div .J-notime").hide();
        } else {
            $(".J-light-balance+div .J-timing").hide();
            $(".J-light-balance+div .J-notime").show();
        }
    });

    // 曝光
    $blk = $(".J-img-exposure+div");
    $blk.find("[name=\"iptExpMode\"]").change(function () {
        if ($(this).val() == "0") {
            $("#selElcShutter,#iptGainAdjus").prop("disabled", true);
            $("[slider=\"gipcclrngainctrl\"]").slider("disable");
        } else {
            $("#selElcShutter,#iptGainAdjust").prop("disabled", false);
            $("[slider=\"gipcclrngainctrl\"]").slider("enable");
        }
    });
    setEditNumberStyle($("#iptGainAdjust"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });
    $blk.find("[slider]").slider({
        min: 0, max: 255, value: 0,
        slide: function (evt, ui) {
            $("#iptGainAdjust").val(ui.value);
        }, change: function (evt, ui) {
            if (!imageVariables.inited) return;
            $("#iptGainAdjust").val(ui.value);
            imageConfigSave();
        }
    });

    // 白平衡
    $blk = $(".J-white-balance+div");
    $("#selWB").change(function () {
        $("#iptRedGain,#iptGreenGain,#iptBlueGain").prop("disabled", $(this).val() == "1" ? false : true);
        $("[slider=\"gipcclrngainrctrl\"],[slider=\"gipcclrngaingctrl\"],[slider=\"gipcclrngainbctrl\"]").slider($(this).val() == "1" ? "enable" : "disable");
    });
    setEditNumberStyle($blk.find(".mini-input"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });
    $blk.find("[slider]").each(function () {
        var $this = $(this);
        var $ipt = $this.siblings('input');
        $this.slider({
            min: $ipt.attr("min"), max: $ipt.attr("max"), value: $ipt.val()
            , slide: function (evt, ui) {
                $ipt.val(ui.value);
            }, change: function (evt, ui) {
                if (!imageVariables.inited) return;
                $ipt.val(ui.value);
                imageConfigSave();
            }
        });
    });

    // 视频调节
    $blk = $(".J-video-adjust+div");
    setEditNumberStyle($blk.find("input.mini-input"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });
    $blk.find("[slider]").each(function () {
        var $this = $(this);
        var $ipt = $this.siblings('input');
        $this.slider({
            min: $ipt.attr("min"), max: $ipt.attr("max"), value: $ipt.val()
            , slide: function (evt, ui) {
                $ipt.val(ui.value);
            }, change: function (evt, ui) {
                if (!imageVariables.inited) return;
                $ipt.val(ui.value);
                imageConfigSave();
            }
        });
    });

    $("#selDigitDenoise").change(function () {
        var b2dEn = false, b3dEn = false;
        var val = ParseInt($(this).val());
        switch (val) {
            case 1: b2dEn = true;
                break;
            case 2: b3dEn = true;
                break;
            case 3: b2dEn = b3dEn = true;
                break;
        }
        if (b2dEn) {
            $("#iptDigitDenoise2").prop("disabled", false);
            $("[slider=\"gipcclrucdnr2dstrength\"]").slider("enable");
        } else {
            $("#iptDigitDenoise2").prop("disabled", true);
            $("[slider=\"gipcclrucdnr2dstrength\"]").slider("disable");
        }
        if (b3dEn) {
            $("#iptDigitDenoise3").prop("disabled", false);
            $("[slider=\"gipcclrucdnr3dstrength\"]").slider("enable");
        } else {
            $("#iptDigitDenoise3").prop("disabled", true);
            $("[slider=\"gipcclrucdnr3dstrength\"]").slider("disable");
        }
    });

    // 背光
    $blk = $(".J-backlight+div");
    $blk.find("[name='iptBkCps']").change(function () {
        var $this = $(this);
        if (!$this.prop("checked")) return;
        $("#selBkQua").prop("disabled", $this.val() == "true" ? false : true);
    });


    if (checkPluginInstall()) {
        var player = $('#videoBlock');
        player.isPlayer('initVideoWindow', getDeviceValue()).isPlayer('stopAllVideo');
        player.isPlayer('setPlayWindowNum', 2);
        player.isPlayer('setWindowType', DEFAULT_WINDOW);
        player.isPlayer('setDeviceChannelNum', getTotalChannelNum());
    }

    // 去雾
    $blk = $(".J-img-defog+div");
    $blk.find("[slider]").each(function () {
        var $this = $(this);
        var $ipt = $this.siblings('input');
        $this.slider({
            min: $ipt.attr("min"), max: $ipt.attr("max"), value: $ipt.val()
            , slide: function (evt, ui) {
                $ipt.val(ui.value);
            }, change: function (evt, ui) {
                if (!imageVariables.inited) return;
                $ipt.val(ui.value);
                imageConfigSave();
            }
        });
    });
    $("#selDefogMode").change(function () {
        var bDis = $(this).val() != 1;
        $("[slider='gipcclrucdefogstrength']").slider(bDis ? "disable" : "enable");
        $("#iptDefogStrength").prop("disabled", bDis)
    });
    setEditNumberStyle($blk.find("input.mini-input"), false, function ($inst, val, newVal) {
        $inst.siblings("div").slider("value", ParseInt(newVal));
    });

    $(".J-btn-save").click(imageConfigSave);
    channelList.change(onChannelChange).change();
}

/**
 * 图像恢复默认
 */
function onImageRestore() {
    loading(true);
    var defaultIndex = isXVR() ? [24] : [22];

    api.default(REQUEST_SET, {
        "channel": Number($(".J-img-channel").val()),
        "defaultItemList": defaultIndex
    }, function (code, data) {
        loading(false);
        rightPopup(code == 0 ? lang.saved : lang.savedfail);
        onChannelChange();
    })
}

function onChannelChange() {
    $('#videoBlock').addClass('invisible');
    imageVariables.inited = false;
    var channelList = $(".J-img-channel");
    var player = $('#videoBlock');
    var lastPlayCh = channelList.data("lastPlayCh");
    var channel = channelList.val();

    lastPlayCh !== undefined && player.isPlayer("stopPreview", lastPlayCh);
    channelList.data("lastPlayCh", channel);

    if (checkPluginInstall()) {
        player.isPlayer('startPreview', 1, channel);
    } else {
        $('#videoBlock>.J-plugin-block').html('')
        var callback = function () {
            configPurePlay(channel, null, lastPlayCh, imageVariables.wsId);
            imageVariables.wsId++;
        };
        getPlayEncodeInfo(channel, callback, true);
    }

    loading(true);
    var cbFin = function (data) {
        loading(false);
        if (data) {
            $("[matchval='imageParam.base.brightness.']").attr("max", data.base.brightnessMax);
            $("[matchval='imageParam.base.contrast.']").attr("max", data.base.contrastMax);
            $("[matchval='imageParam.base.saturation.']").attr("max", data.base.saturationMax);
            $("[matchval='imageParam.base.sharpness.']").attr("max", data.base.sharpnessMax);
            setSlider();
            var imgEnable = Object.keys(data).length;
            if (imgEnable == 1) {
                // 只显示图像调节模块
                $(".J-img-tab>h3").addClass("hide");
                $(".J-img-tab>div").addClass("hide");
                $(".J-img-adjust").removeClass("hide");
                $(".J-img-adjust+div").removeClass("hide");
            }

            $(".J-img-tab>div").removeClass("hide");
            initImageConfigDisplay(data)

            // 补光定时时间初始化
            if (data.fillLight) {
                $("#selDaytimeHour").val(Math.floor(data.fillLight.dawnTime / 60));
                $("#selDaytimeMin").val(data.fillLight.dawnTime % 60);
                $("#selNighttimeHour").val(Math.floor(data.fillLight.darkTime / 60));
                $("#selNighttimeMin").val(data.fillLight.darkTime % 60);
            }

            $(".J-img-adjust").click(); // 默认切换会图像设置
            $(".J-control-setting .mini-input").change();
            $(".J-control-setting select").change();

            typeof (data.eq) == "undefined" ? $(".J-xvr-eq").hide() : $(".J-xvr-eq").show();
        }
        imageVariables.inited = true;
    };

    loadImageConfig(channel, function (dtLimit) {
        cbFin(dtLimit);
    });
}

function onUnload() {
    $(".J-img-channel").data('lastPlayCh') !== undefined && $('#videoBlock').isPlayer("stopPreview", $(".J-img-channel").data('lastPlayCh'));
    $('#videoBlock').isPlayer('destroy');
}

/**
 * 加载图像颜色
 * @param {*} channel 通道
 * @param {*} cbFin   成功回调
 */
function loadImageConfig(channel, cbFin) {
    $('#videoBlock').removeClass('invisible');
    api.imageParam(REQUEST_GET, { "channel": Number(channel) }, function (code, data) {
        if (code != CODE_SUCCESS) return;
        autoFillValue('imageParam', data);
        cbFin && cbFin(data);
    });
}

/**
 * 图像颜色保存
 */
function imageConfigSave() {
    loading(true);

    // 补光定时计算
    var dawnTime = $("#selDaytimeHour").val() * 60 + ParseInt($("#selDaytimeMin").val());
    var darkTime = $("#selNighttimeHour").val() * 60 + ParseInt($("#selNighttimeMin").val());
    var params = getMatchValue("imageParam")
    params.channel = Number($(".J-img-channel").val());

    if (isXVR()) {
        var xvrParams = ["base", "channel", "eq"];
        params = objKeyDeal(params, xvrParams, false); // 去除 除xvrParams里的参数
    } else {
        params.fillLight.dawnTime = Number(dawnTime);
        params.fillLight.darkTime = Number(darkTime);
        params.backlight.enable = params.backlight.enable == "true" ? true : false;
        params = objKeyDeal(params, ["eq"], true); // 删除xvr的eq参数
    }

    api.imageParam(REQUEST_SET, params, function (code, data) {
        rightPopup(code == CODE_SUCCESS ? lang.saved : lang.savedfail);
    })
}

/**
 * 初始化时间选择
 */
function initFillLightTime() {
    var hours = "";
    for (var i = 0; i < 24; ++i) {
        hours += '<option value="' + i + '">' + i + '</option>';
    }
    $("#selDaytimeHour,#selNighttimeHour").html(hours);

    var mins = "";
    for (var i = 0; i < 60; ++i) {
        mins += '<option value="' + i + '">' + i + '</option>';
    }
    $("#selDaytimeMin,#selNighttimeMin").html(mins);
}

/**
 * 初始化图像颜色配置显示
 * @param {obj} data 接口返回的数据
 */
function initImageConfigDisplay(data) {

    // 按照模块显示初始化显示
    var imgConfigEnabled = [
        { confName: 'fillLight', eleName: '.J-light-balance' }, // 补光
        { confName: 'exposure', eleName: '.J-img-exposure' }, // 曝光
        { confName: 'backlight', eleName: '.J-backlight' },
        { confName: 'whiteBalance', eleName: '.J-white-balance' },
        { confName: 'digitalDenoise', eleName: '.J-video-adjust' },
        { confName: 'imageEnhance', eleName: '.J-img-enhance' },
        { confName: 'defog', eleName: '.J-img-defog' },
        { confName: 'ircut', eleName: '.J-ircut' },
        // 灯板控制
        { confName: 'lightBoard', eleName: '.J-lightBoard' }
    ]

    // 遍历控制模块显示
    for (var i = 0; i < imgConfigEnabled.length; i++) {
        $(imgConfigEnabled[i].eleName).addClass("hide");

        if (data[imgConfigEnabled[i].confName]) {
            $(imgConfigEnabled[i].eleName).removeClass("hide");
        }
    }
}