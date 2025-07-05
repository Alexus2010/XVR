/**
 * 公共初始化, 页面必须通过该函数来进行初始化
 * @param {*} func
 * @param {*} addScripts
 */
function commonInit(func) {
    useIEDetection();
    $LAB.script(addCacheSign([
        '/statics/lib/jquery.cookies.2.2.0.min.js',
        '/statics/js/version.js',
        '/statics/js/variable.js',
        '/statics/js/common.js',
        '/lightCustomizeConf.js'
    ], '?v=' + new Date().getTime())).wait(function () {
        var arrayScripts = [
            '/statics/lang/' + getLang() + '.js',
            '/statics/js/api.js',
            '/statics/js/isPlayer.js',
            '/statics/lib/doT.min.js',
            '/views/component/module.js',
            '/statics/lib/jquery-ui/jquery-ui.min.js',
            '/statics/lib/timeSegSelect/jplg-timeSegSelect.js',
            '/statics/lib/persianDatepicker/persianDatepicker.js',
            '/statics/lib/commCal/jplg-commCal.js',
            '/statics/lib/datatables/datatables.min.js',
            '/statics/lib/qrcode.js',
            '/statics/lib/jquery-ui/jquery-ui-timepicker-addon.js',
            '/statics/lib/bit64To2.js',
            '/statics/lib/utils/common/encryption/base64.js',
            '/statics/lib/utils/common/encryption/MD5.js',
            '/statics/lib/utils/common/encryption/longseSha256.js',
            '/statics/lib/utils/common/encryption/sha265.js',
            '/statics/lib/utils/common/encryption/aes.min.js',
            '/statics/lib/utils/common/encryption/aes128.js'
        ];
        if (isIE()) {
            arrayScripts.push('/statics/js/apiPlugin.js');
        } else {
            arrayScripts = arrayScripts.concat([
                '/statics/js/websocket.js',
                '/statics/lib/utils/demand/localPlugin.js',
                '/statics/lib/utils/common/video/wfs.js',
                '/statics/lib/utils/demand/sdkIpc.js'
            ])
        };
        $LAB.script(addCacheSign(arrayScripts, '?ver=' + versionconfig.web_version)).wait(function () {
            func && func();
        });
    });
}

function addCacheSign(data, sign) {
    var list = [];
    for (var i = 0; i < data.length; i++) {
        list.push(data[i] + sign);
    };
    return list;
}

/**
 * 初始化当前页面的dot模板
 * @param  {array} paramArray
 * [{'id': '模板ID', 'data': '模板数据', 'def': '预定义模板', 'setting': {}}], 除了id都是可选参数
 */
function initDot(paramArray) {
    $('.J-dot-template').each(function () {
        var that = $(this);
        that.removeClass('dot-template J-dot-template'); // 只能初始化1次
        var id = that.attr('id');
        if (id && paramArray) {
            var dt = null;
            for (var i = 0; i < paramArray.length; ++i) {
                if (paramArray[i].id === id) {
                    dt = paramArray[i];
                    break;
                };
            };
            if (dt) {
                var retDot = doT.template(that.html(), dt.setting, dt.def)(dt.data);
                return that.html(retDot);
            };
        };
        var retDot = doT.template(that.html())();
        that.html(retDot);
        return;
    });
}

/**
 * 渲染指定模板
 * @param {*} name
 * @param {*} dt
 */
function dotRender(name, dt) {
    return window.module[name](dt);
}

/**
 * 加载初始化表格
 * @param {*} tab 节点
 * @param {*} param 初始化参数
 */
function initSimpleTable(tab, param) {
    var prm = $.extend({
        info: false,
        paging: false,
        searching: false,
        fixedHeader: { header: false, footer: false },
        language: { infoEmpty: '', emptyTable: '', zeroRecords: '' }
    }, param ? param : {});
    if (!prm.scrollY) {
        var ph = tab.parent().height();
        prm.scrollY = ph - 50;
    }
    tab.DataTable(prm);
}

/*
* IE检测，不支持IE8
*/
function useIEDetection() {
    if (navigator.appName == 'Microsoft Internet Explorer' && parseInt(navigator.appVersion.split(';')[1].replace(/[ ]/g, '').replace('MSIE', '')) < 9.0)
        alert('IE versions earlier than 9.0, does not support this feature');
}

function isWinOS() {
    return window.navigator.platform === 'Win32' || window.navigator.platform === 'Windows';
}

function isMacOS() {
    return navigator.platform === 'Mac68K' || navigator.platform === 'MacPPC' || navigator.platform === 'Macintosh' || navigator.platform === 'MacIntel';
}

function isIE() {
    var agent = window.navigator.userAgent;
    return agent.indexOf('Trident') >= 1 || (agent.indexOf('compatible') !== -1 && agent.indexOf('MSIE') !== -1 && agent.indexOf('Opera') === -1);
}

function isIE9() {
    return window.navigator.userAgent.indexOf('MSIE 9.0') !== -1;
}

function isChrome() {
    return window.navigator.userAgent.indexOf('Chrome') !== -1;
}

function isFirefox() {
    return window.navigator.userAgent.indexOf('Firefox') > -1;
}

function isSafari() {
    // chrome拥有safari字符，判断不出
    // 需要判断拥有safari字符，且没有chrome字符的
    return /Safari/.test(window.navigator.userAgent) && !/Chrome/.test(window.navigator.userAgent);
}

function isOpera() {
    return window.navigator.userAgent.indexOf('Opera') !== -1;
}

function isEdge() {
    return window.navigator.userAgent.indexOf('Edge') !== -1;
}

/**
 * 是否登录
 */
function isLogin() {
    var user = getUserName();
    return user;
}

/**
 * 获取cookie里的用户名
 * @return {string} 没有时返回null
 */
function getUserName() {
    var name = getCookie(USER_NAME);
    return name ? name : '';
}

/**
 * 设置标题
 * @param {*} title
 */
function setTitle(title) {
    $(document).attr('title', title);
}

/**
 * 保存cookie数据
 */
function setCookie(name, value) {
    $.cookies.set(name, value);
}

/**
 * 删除cookie数据
 */
function deleteCookie(name) {
    $.cookies.del(name);
}

/**
 * 获取cookie数据
 */
function getCookie(name) {
    return $.cookies.get(name);
}

/**
 * 获取语言cookies
 */
function getLang() {
    var lang = getCookie(LANG);
    return lang ? lang : styleConf.defaultLang;
}

/**
 * 设置语言cookies
 * @param {*} name
 * @param {*} expire
 */
function setLang(name, expire) {
    $.cookies.set(LANG, name, { expires: expire ? expire : 365 });
}

/**
 * 获取ip
 */
function getHost() {
    var locations = window.location.href.split('/')[2],
        isIpv6 = locations.indexOf('[') > -1 && locations.indexOf(']') > -1;
    url = isIpv6 ? locations.match(/\[(\S*)\]/)[0] : locations.split(':')[0];
    return getCookie('debugIP') ? getCookie('debugIP') : url;
}

/**
 * 获取端口
 */
function getHttpPort() {
    var locations = window.location.href.split('/')[2],
        isIpv6 = locations.indexOf('[') > -1 && locations.indexOf(']') > -1;
    port = isIpv6 ? locations.split(']:')[1] : locations.split(':')[1];
    return getCookie('debugPort') ? getCookie('debugPort') : parseInt(port ? parseInt(port) : DEFAULT_HTTP_PORT);
}

/**
 * 获取tcp端口
 */
function getTcpPort() {
    return getDevConf('tcpPort');
}

/**
 * 获取rstp端口
 */
function getRstpPort() {
    return getDevConf('rtspPort');
}

/**
 * 刷新页面
 */
function reload(url) {
    window.location.href = url ? url : window.location.href;
}

/**
 * 右下角弹出框
 * @param {*} content
 * @param {*} header
 */
function rightPopup(content, header, time) {
    $('body').append(dotRender('rightPopupModel', {
        'content': content,
        'header': header ? header : lang.explain
    }));
    window.timerRightCornerPopup && clearTimeout(window.timerRightCornerPopup);
    window.timerRightCornerPopup = setTimeout(function () { $('.J-right-popup').remove(); }, time ? time : 2000);
}

/**
 * 显示/隐藏全局的loading遮挡界面
 * @param  {bool} isShow 是否显示
 * @param  {int} iInterval 遮挡延时(防止闪屏), 单位毫秒, 默认500
 * @return {void}
 */
function loading(isShow, iInterval) {
    iInterval || (iInterval = 1000);
    if (isShow) {
        $('body').prepend(dotRender('loadingModel'));
        var i = 0;
        window.loadingTimer = setInterval(function () {
            i++;
            if (i == LOADING_TIME / 1000) {
                loading(false);
                clearInterval(window.loadingTimer);
            }
        }, iInterval);
    } else {
        window.loadingTimer && clearInterval(window.loadingTimer);
        window.loadingTimer = null;
        $('.J-loading-block').remove();
    }
}

/**
 * 判断设备类型
 * @param  {str} chkType 检测设备类型
 * @return {bool}
 */
function isCpuEq(chkType) {
    for (var i = 0; i < arguments.length; ++i) {
        if (getDevConf('platformType') == arguments[i])
            return true;
    }
    return false;
}

/**
 * 调用HTTP接口
 * @param {*} url 接口路径
 * @param {*} data 提交参数
 * @param {*} callback 回调
 * @param {*} setting 配置属性
 * @param {*} isSync 是否异步
 */
function callHttp(url, data, callback) {
    var urls = isDebugHost() ? '/callXvrApi' + url : url;
    $.ajax({
        headers: {
            "Api-Version": 'v1.1.1'
        },
        type: "POST",
        url: urls,
        cache: false,
        // contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        complete: function (xhr) {
            if (xhr.status === HTTP_OK) { //200
                try {
                    var response = $.parseJSON(xhr.responseText),
                        code = parseInt(response.code);
                    loading(false);
                    var tip = getDeviceCode(code);
                    var
                        // notXvr8001 = isXVR() ? (code != CODE_CLOUD_STORAGE_FAILE) : true, // xvr增加8001错误码
                        notLoginAnd5001 = window.location.pathname != URL_LOGIN && code != CODE_INVALID_USER,
                        notRealtimeAnd2002 = !getConf('isRealtime') || (getConf('isRealtime') && code != CODE_SET_DATABASE_ERROR); //预览页面不提示2002
                    // 预览界面获取通道列表名不提示2001
                    isGetChannelNameAndCodeEqual2001 = url === '/api/channel/priview-channel-name' && data.action === 'get' && code === CODE_GET_DATABASE_ERROR;
                    if (code != CODE_SUCCESS && notLoginAnd5001 && notRealtimeAnd2002 && !isGetChannelNameAndCodeEqual2001) {
                        rightPopup(code + ':' + tip);
                    }
                    if (urls.indexOf('heart-beat') > -1 && code != CODE_SUCCESS) logoutEvent();
                    callback && callback(response.code, response.data);
                } catch (error) { }
            }
        },
        error: function (e) {
            if (!getStorageItem('upgrade')) {
                !$('.J-loading-block').length && rightPopup(e.status + ':' + lang.loginError);
                loading(false);
                (e.status == 401) && (window.location.href = URL_LOGIN);
                (urls.indexOf('heart-beat') > -1) && logoutEvent();
            }
        }
    });
}

/**
 * 根据设备错误码显示文案
 * @param {*} code
 */
function getDeviceCode(code) {
    var tip = '';
    switch (code) {
        case 1001: tip = lang.jsonError; break;
        case 1002: tip = lang.jsonIllegal; break;
        case 1003: tip = lang.operateUnsupport; break;
        case 1004: tip = lang.jsonCreateError; break;
        case 2001: tip = lang.getDatabaseError; break;
        case 2002: tip = lang.setDatabaseError; break;
        case 2003: tip = lang.getChannelError; break;
        case 2004: tip = lang.setChannelError; break;
        case 3001: tip = lang.actionUnsupport; break;
        case 3002: tip = lang.channelConfigurationUnsupport; break;
        case 3003: tip = lang.deviceConfigurationUnsupport; break;
        case 3004: tip = lang.channelCruising; break;
        case 3005: tip = lang.securityCodeError; break;
        case 3006: tip = lang.passwordVerificationFailed; break;
        case 4001: tip = lang.manyConnections; break;
        case 4002: tip = lang.videoEnd; break;
        case 4003: tip = lang.videoError; break;
        case 4004: tip = lang.streamOffline; break;
        case 4005: tip = lang.requestError; break;
        case 4006: tip = lang.invalidIndex; break;
        case 4007: tip = lang.recreateLink; break;
        case 4008: tip = lang.invalidSession; break;
        case 5001: tip = lang.invalidUser; break;
        case 5002: tip = lang.invalidPassword; break;
        case 5003: tip = lang.invalidId; break;
        case 5004: tip = lang.encryptUnsupported; break;
        case 6001: tip = lang.checkError; break;
        case 6002: tip = lang.verifyError; break;
        case 6003: tip = lang.randomValueError; break;
        case 6004: tip = lang.settingError; break;
        case 7001: tip = lang.sizeInvalid; break;
        case 7002: tip = lang.noMatch; break;
        case 7003: tip = lang.formatError; break;
        case 7004: tip = lang.contentInvalid; break;
        case 8001: tip = lang.cloudStorageFail; break;
        default: break;
    };
    return tip;
}

/**
 * DOM自动赋值
 * @param {*} dtName DOM属性开始名 model.value
 * @param {*} data 接口返回的数据
 */
function autoFillValue(dtName, data) {
    dtName && $("[matchVal^=\"" + dtName + ".\"]").each(function () {
        var keys = $(this).attr('matchVal').substr(dtName.length + 1).split('.'),
            behavior = keys.pop(),//最后一位，执行函数
            val = data;
        for (var i = 0; i < keys.length; ++i) {
            var info = {};
            if (keys[i].substr(0, 1) === '[') {
                // 数组模式
                val = val[ParseInt(keys[i].substring(1, keys[i].length - 1))];
            } else if (typeof val[keys[i]] !== 'undefined') {
                // 下拉选项
                var key = keys[i] + 'List';
                if (val[key]) info[key] = val[key];
                // 限制范围
                var range = keys[i] + 'Min';
                if (val[range] !== 'undefined') info[val[range]] = val[keys[i] + 'Max'];
                // 当前值
                val = val[keys[i]];
            } else {
                val = undefined;
                break;
            }
        }
        behavior || (behavior = 'setValue'); // 默认行为
        // 使用预定义 behavior 或自行按照命名规则定义
        // 行为函数命名规则, beh + name, name在DOM中首字母小写, 在定义时首字母大写
        behavior = 'beh' + behavior.substr(0, 1).toUpperCase() + behavior.substr(1);
        if (typeof window[behavior] === 'function') {
            window[behavior].call(this, val, info);
        } else {
            console.log(behavior + ' undefined error');
        }
    });
}

/**
 * 设置数值
 * @param {*} dt
 */
function behSetValue(dt, info) {
    if (dt === undefined) return;
    var that = $(this);
    var tagName = that.prop('tagName'),
        type = that.attr('type');
    if (tagName === 'INPUT' && type === 'radio') {
        $("input[name='" + that.attr("name") + "'][value='" + dt + "']").prop('checked', true).change();
    } else if (tagName === 'INPUT' && type === 'checkbox') {
        that.prop('checked', dt == '1').change();
    } else if (tagName === 'LABEL' || tagName === 'P') {
        that.text(dt);
    } else {
        var id = Object.keys(info)[0];
        if (id !== 'undefined') {
            // 控制下拉选项
            tagName == 'SELECT' && $('#' + id).html(dotRender('formOptionModel', {
                list: info[id],
                default: that.attr('default') ? that.attr('default').split(',') : ''
            }));
            // 控制最大最小值
            tagName == 'INPUT' && that.attr({ 'min': id, 'max': info[id] });
        }
        $(this).val(dt).change();
    }
}

/**
 * 根据 matchVal 自动生成相应的json参数
 * @param  {string} name matchVal 前缀
 * @return {map} 对应 matchVal 的map数据
 */
function getMatchValue(name) {
    var dt = {}, isArray = false;
    $("[matchVal^=\"" + name + ".\"]").each(function () {
        var that = $(this), arrName = that.attr('matchVal').split('.'), ref = dt;
        // 最后一个为初始化用的设置函数
        arrName.pop();
        var last = arrName.length - 1, lastName = arrName[last];
        // 第一个是数据组名
        for (var i = 1; i < arrName.length; ++i) {
            if (arrName[i] === '') break;
            if (arrName[i].substr(0, 1) === '[') {
                var idx = ParseInt(arrName[i].substring(1, arrName[i].length - 1));
                if (i === 1) {
                    // 第一级为数组, 先用map处理, 最后再转为数组
                    isArray = true;
                    // 不要在第一级进行复制, 会解除引用
                } else {
                    ref[lastName] instanceof Array || (ref[lastName] = []);
                    ref = ref[lastName];
                }
                lastName = idx;
            } else {
                if (i !== 1) {
                    ref[lastName] instanceof Object || (ref[lastName] = {});
                    ref = ref[lastName];
                }
                lastName = arrName[i];
            }
        }
        var getter = that.attr('lsGetter');
        if (getter && typeof window[getter] === 'function') { } else { getter = 'getValue'; }
        if (last === 0) {
            var tmp = window[getter](that, dt);
            tmp instanceof Array && (isArray = true);
            $.extend(dt, tmp);
        } else {
            ref[lastName] = window[getter](that, dt)
        }
    });

    if (isArray) {
        var arr = [];
        for (var k in dt) {
            var idx = ParseInt(k);
            $.isNumeric(idx) && (arr[idx] = dt[k]);
        }
        return arr;
    }
    return dt;
}

/**
 * 获取数据
 * @param {*} that
 */
function getValue(that) {
    var tagName = that.prop('tagName'),
        paramType = that.attr('str'),
        value = '';
    // tagName默认大写
    switch (tagName) {
        case 'INPUT':
            var type = that.attr('type');
            switch (type) {
                case 'text':
                case 'password':
                case 'hidden':
                    value = that.val();
                    break;
                case 'checkbox':
                    value = that.prop('checked') ? true : false;
                    break;
                case 'radio':
                    var name = that.attr('name');
                    value = $("[type='radio'][name='" + name + "']:checked").val();
                    break;
            }
            break;
        case 'SELECT':
            value = that.val();
            break;
        case 'P':
        case 'LABEL':
            value = that.text();
            break;
        default:
            value = that.val();
            break;
    }
    return paramType ? value : ParseInt(value);
}

function compile(b) {
    var d = String.fromCharCode(b.charCodeAt(0) + b.length);
    for (var a = 1; a < b.length; a++) { d += String.fromCharCode(b.charCodeAt(a) + b.charCodeAt(a - 1)) } return escape(d);
};

function uncompile(b) {
    b = unescape(b);
    var d = String.fromCharCode(b.charCodeAt(0) - b.length);
    for (var a = 1; a < b.length; a++) { d += String.fromCharCode(b.charCodeAt(a) - d.charCodeAt(a - 1)) } return d;
};

function getStorageItem(name) {
    return sessionStorage.getItem(name);
}

function setStorageItem(name, key) {
    sessionStorage.setItem(name, key);
}

function removeStorageItem(name) {
    sessionStorage.removeItem(name);
}

function setAuthInfo(label) {
    var key = label + '&' + getStorageItem(USER_AUTH);
    return compile(key);
}

/**
 * 生成密码字符串
 * 33~47：!~/
 * 48~57：0~9
 * 58~64：:~@
 * 65~90：A~Z
 * 91~96：[~`
 * 97~122：a~z
 * 123~127：{~
 * @param length 长度
 * @param hasNum 是否包含数字 1-包含 0-不包含
 * @param hasChar 是否包含字母 1-包含 0-不包含
 * @param hasSymbol 是否包含其他符号 1-包含 0-不包含
 * @param caseSense 是否大小写敏感 1-敏感 0-不敏感
 * @param lowerCase 是否只需要小写，只有当hasChar为0且caseSense为1时起作用 1-全部小写 0-全部大写
 */
function genEnCode(length, hasNum, hasChar, hasSymbol, caseSense, lowerCase) {
    var m = '';
    !hasNum && (hasNum = 1);
    !hasChar && (hasChar = 1);
    !hasSymbol && (hasSymbol = 0);
    !caseSense && (caseSense = 0);
    !lowerCase && (lowerCase = 1);
    if (hasNum == '0' && hasChar == '0' && hasSymbol == '0') return m;
    for (var i = length; i >= 0; i--) {
        var num = Math.floor((Math.random() * 94) + 33);
        if (((hasNum == '0') && ((num >= 48) && (num <= 57))) || ((hasChar == '0') && (((num >= 65) && (num <= 90)) || ((num >= 97) && (num <= 122))))
            || ((hasSymbol == '0') && (((num >= 33) && (num <= 47)) || ((num >= 58) && (num <= 64)) || ((num >= 91) && (num <= 96)) || ((num >= 123)
                && (num <= 127))))) {
            i++;
            continue;
        }
        m += String.fromCharCode(num);
    }
    if (caseSense == '0') m = (lowerCase == '0') ? m.toUpperCase() : m.toLowerCase();
    return m;
}

function setAuth() {
    setStorageItem(USER_AUTH, hex_md5(genEnCode(20)));
}

function getAuth() {
    var val = getStorageItem('authInfo');
    return val ? uncompile(val).split('&')[0] : getCookie('pwd');
}

/**
 * 获取函数名
 * @param {*} funcName
 */
function getFuncName(funcName) {
    var data = { func: funcName, param: '' };
    if (funcName && funcName.indexOf('(') > -1) {
        data.param = funcName.match('\\((.+?)\\)')[1];
        data.func = funcName.split('(')[0];
    };
    return data;
}

/**
 * 获取封装好的时间段数据(单个时间段情况下)
 * @param {arr} recData 时间段控件数据
 * @returns 封装好的时间段
 */
function getSchedTime(recData) {
    var schedTime = [];

    // 获取时间小段数据
    var getDayArr = function (i) {
        var dayArr = [];

        for (var j = 0; j < 6; ++j) {
            var sHour = recData[i][j] ? recData[i][j].sHour : 0,
                eHour = recData[i][j] ? recData[i][j].eHour : 0,
                sMin = recData[i][j] ? recData[i][j].sMin : 0,
                eMin = recData[i][j] ? recData[i][j].eMin : 0;

            var startTime = (sHour * 3600 + sMin * 60);
            var endTime = (eHour * 3600 + eMin * 60);
            dayArr.push({ startTime: startTime, endTime: endTime });
        }
        return dayArr;
    }

    // 拼接一周时间数据
    for (var i = 0; i < recData.length; ++i) {
        schedTime.push({
            weekDay: i,
            segNum: recData[i].length,
            oneDay: getDayArr(i),
        })
    }

    return schedTime;
}

/**
 * 创建并下载文件
 * @param  {String} fileName 文件名
 * @param  {String} content  文件内容
 */
function createAndDownloadFile(fileName, content) {
    try {
        var aTag = document.createElement('a');
        var blob = new Blob([content]);
        if ('msSaveOrOpenBlob' in navigator) {
            // Microsoft Edge and Microsoft Internet Explorer 10-11
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            aTag.download = fileName;
            aTag.href = URL.createObjectURL(blob);
            aTag.click();
            setTimeout(function () {
                URL.revokeObjectURL(blob);
            }, 100);
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 设置初始化音视频
 * @param {*} channel
 * @param {*} callback
 */
function getPlayEncodeInfo(channel, callback, isConfig) {
    var list = {};
    api.getPlayEncode(REQUEST_GET, { 'channel': parseInt(channel) }, function (code, data) {
        $('#videoBlock').data('videoInfo', null);
        if (code != CODE_SUCCESS && !isConfig) {
            callback && callback(code);
        };
        var streamEncode = data ? data.vidoStreamEncode : [];
        for (var i = 0; i < streamEncode.length; i++) {
            var widthAndHeight = streamEncode[i].encodeResolution.split('x');
            list[streamEncode[i].streamNo] = {
                'videoCode': VIDEO_CODEC[streamEncode[i].encodeType.toLowerCase()],
                'frameRate': streamEncode[i].encodeFrameRate,
                'bitRate': streamEncode[i].encodeBiterate,
                'width': parseInt(widthAndHeight[0]),
                'height': parseInt(widthAndHeight[1]),
            };
        };
        $('#videoBlock').data('videoInfo', list);
        $('#videoBlock').data('audioInfo', AUDIO_CODEC[data.audioStreamEncode.encodeType]);
        callback && callback(code, list, AUDIO_CODEC[data.audioStreamEncode.encodeType]);
    });
}

/**
 * 配置页纯去插件播放
 * @param {*} channel
 * @param {*} stream
 */
function configPurePlay(channel, stream, lastChannel, id) {
    var index = parseInt(id) - 1;
    index != -1 && deviceSdk.stopVideo(index);
    setTimeout(function () {
        stream == null && (stream = 1);
        var videoInfo = $('#videoBlock').data('videoInfo')[stream];
        if (!videoInfo) return;
        var model = videoInfo.videoCode == 96 ? PLAY_MODE_H264 : PLAY_MODE_H265;
        $('#videoBlock').html(dotRender('pluginModel', { 'mode': model, 'isWin': isWinOS() }));
        $('#videoBlock').isPlayer('setPlayMode', model);
        var tag = videoInfo.videoCode == 96 ? 'v264' : 'c265'
        deviceSdk.init({
            'tags': tag,
            'deviceIp': String(getHost()),
            'devicePort': String(getHttpPort()),
            'width': videoInfo.width,
            'height': videoInfo.height,
            'audioCode': 16,
            'videoCode': videoInfo.videoCode == 96 ? 'H264Raw' : 'H265Raw',
            'onCallback': onConfigPureMsg,
            // 'sessionID': getCookie(USER_ID)
            'sessionID': getSessionInfo(),
            'tag265Name': tag
        });
        // MAC下不提示下载控件
        if ((parseInt(videoInfo.width) > 1920 || parseInt(videoInfo.height) > 1080) && !isMacOS()) rightPopup(lang.useControl, null, 7000);
        var layer = $('#videoBlock').find("canvas.draw-box");
        layer.prop("width", layer.width())
        layer.prop("height", layer.height())
        deviceSdk.play(false, channel, stream, 0);
    }, 500);
}

/**
 * 发送停止命令
 * @param {*} wsId
 */
function sendStopMessage(wsId) {
    deviceSdk.wfs.sendMessage(wsId, {
        'action': 'stop',
        'data': {
            'sessionID': getSessionInfo()
        }
    });
    setTimeout(function () { deviceSdk.stopVideo(wsId); }, 500);
}

/**
 * 初始化设备Enable
 * @param {*} conf
 */
function initDevConf(conf) {
    window.devConfig = $.extend(window.devConfig ? window.devConfig : {}, conf);
}

/**
 * 设置设备Enable
 * @param {*} name 标识
 * @param {*} val 数值
 */
function setDevConf(name, val) {
    window.devConfig[name] = val;
}

/**
 * 获取设备Enable
 * @param {*} name 标识
 */
function getDevConf(name) {
    var conf = window.devConfig ? window.devConfig : {};
    return name ? conf[name] : conf;
}

/**
 * ivms用于进入配置页后
 */
function ivmsAutoJumpPage(name, pwd, style, lang, isCruise) {
    window.onerror = function () { return true; };
    window.confirm = function () { };
    window.alert = function () { };
    var lan = lang && LANG_SUPPORT.indexOf(lang) > -1 ? lang : 'en';
    login(name, pwd, lan);
    style && setStorageItem('style', style);
    isCruise && setStorageItem("isIvmsCruise", true);
    setStorageItem('isIvms', true);
}

/**
 * ivms隐藏顶部菜单专用
 */
function ivmsFrameEvent() {
    $('#options').click();
    $('.main').remove();
}

/**
 * ivms配置专用
 */
function ivmsConfigEvent() {
    $('.options-menu1').remove();
    $('.J-options-menu dd').eq(0).remove();
    $("<style></style>").text(getStorageItem('style')).appendTo($("head"));
    $('#userManageTitle').hide();
}

/*
 * ivms巡航专用
 */
function ivmsCruiseEvent() {
    $('.main').remove();
}

/**
 * 用于自动跳转到管理员修改密码页面
 */
function jumpModifPswView() {
    setConf("weekPwdLimit", true);
    deleteCookie("reload2MdyPwd");
    $(".J-main-list>li").hide();
    $("#options").parents("li").show();
    $("#options").click();
}

/**
 * 获取设备类型
 * @param {*} id
 */
function getDeviceType(id) {
    var type = '';
    switch (id) {
        case 1:
            type = 'NVR';
            break;
        case 2:
            type = 'XVR';
            break;
        case 3:
            type = 'WIFI NVR';
            break;
        case 4:
            type = 'WIFI XVR';
            break;
    };
    return type;
}

/**
 * 更新插件提醒
 */
function updatePlugin(tip) {
    var bUpdatePlguin = getCookie('updateTips');
    if (bUpdatePlguin) {
        if (navigator.platform == "Win32") {
            if (tip) return $('.J-down-tip').show().attr('href', getPluginPath());
            var warning = confirm(lang.upgradeplugin);
            warning ? doPluginDownload() : setCookie('updateTips', 'false');
        } else {
            setCookie('updateTips', 'false');
        }
    }
}

/**
 * 对象属性操作
 * @param {object} obj 操作对象
 * @param {array} args 操作的键组成的数组
 * @param {boolean} isDel 是否删除 为true时对obj里有args的键进行删除，false时删除obj不包含args的其他键
 * @returns 操作完成的对象
 */
function objKeyDeal(obj, args, isDel) {
    if (isDel) {
        args.forEach(function (item) {
            delete obj[item]
        });
    } else {
        for (var item in obj) {
            for (var i = 0; i < args.length; ++i) {
                if (item == args[i]) {
                    break
                }

                if (i < args.length - 1) {
                    continue
                }
                delete obj[item];
            }
        }
    }
    return obj
}

/**
 * 通用单个时间段组件初始化
 * @param  {Object} $div 绑定的jquery对象
 * @param  {string} cname 识别类名
 * @param  {int} maxNum 单天最大段数
 * @param  {string} clr 可选, css颜色字段 *
 * @return {void}
 */
function initCommSche($div, arrCate, maxNum, clr) {
    $div.timeSegSelect({
        "lang": {
            "week": [
                lang.stweek7,
                lang.stweek1,
                lang.stweek2,
                lang.stweek3,
                lang.stweek4,
                lang.stweek5,
                lang.stweek6
            ],
            "selectAll": lang.stselectall,
            "confirm": lang.confirm,
            "cancel": lang.cancel,
            "copyTo": lang.stcopyto1,
            "del": lang.del,
            "save": lang.save,

        },
        "cate": arrCate,
        "buttons": [{
            "name": '<span class="ui-icon ui-icon-circle-close"></span>' + lang.del,
            "classes": "ui-state-error-text btnDel",
            "click": function () {
                var that = $(this);
                var checkList = $(".J-check-type input:checked").not(".J-check-all");
                var delBtn = $div.find(".btnDel");
                var week = parseInt(delBtn.attr("w"));
                var editTimeRange = $(".J-time-edit input");
                var beginTime = editTimeRange.eq(0).val() * 60 + ParseInt(editTimeRange.eq(1).val()),
                    endTime = editTimeRange.eq(2).val() * 60 + ParseInt(editTimeRange.eq(3).val())
                var name = checkList.eq(0).attr("name");
                $div.timeSegSelect("delCateTimeInTime", week, name, beginTime, endTime);
                that.prop("disabled", true);
                $div.find(".J-time-popup-block").hide();
            }
        },
        {
            "name": '<span class="ui-icon ui-icon-circle-close"></span>' + lang.stdelall,
            "classes": "ui-state-error-text btnDelAll",
            "click": function () {
                $div.timeSegSelect("clearAll").find(".btnDel").prop("disabled", true);
            }
        },
        {
            "name": '<span class="ui-icon ui-icon-circle-check"></span>' + lang.selAll,
            "classes": "btnSelAll",
            "click": function () {
                var fullTime = [
                    [0, 1440]
                ];
                var fullType = [
                    recType2name(RECORD_TYPE_NORMAL)
                ];

                for (var i = 0; i < 7; ++i) {
                    for (var j = 0; j < fullType.length; ++j) {
                        $div.timeSegSelect("setCateTimeData", i, fullType[j], fullTime);
                    }
                }
            }
        }
        ],
        "height": 30,
        "onSelect": function (weekIdx, name, idx, $ele) {
            $(".J-time-edit > input").eq(3).change(function () {
                if (parseInt($(".J-time-edit > input").eq(2).val()) == 24) {
                    $("div.J-time-edit>input").eq(3).val("0")
                }
            })

            $div.find(".btnDel").attr({
                "w": weekIdx,
                "n": name,
                "i": idx
            }).prop("disabled", false);
            var timeData = $div.timeSegSelect("getCateTimeData", weekIdx, name);

            $div.find(".J-time-popup-block").show().position({
                of: $ele,
                at: "top",
                my: "bottom"
            }).find(".J-time-edit>input")
                .eq(0).val(Math.floor(timeData[idx][0] / 60))
                .next().val(timeData[idx][0] % 60)
                .next().val(Math.floor(timeData[idx][1] / 60))
                .next().val(timeData[idx][1] % 60)
                .parents(".J-time-edit").find(".J-time-edit input").prop("checked", false)

            $(".J-check-type input[name='" + name + "']").prop("checked", true);
            var left = $(".J-time-popup-block").css("left").split("px");

            if (parseInt(left[0]) < 0) {
                $(".J-time-popup-block").css("left", 0)
            }
        },
        "onSegChg": function (weekIdx, name, tmDt) {
            if (getWeekSegNum(weekIdx) > MAX_SEG_NUM) {
                setTimeout(function () {
                    rightPopup(lang.tipSegOverflow);
                }, 1);
                $div.timeSegSelect("rollback");
            }
            $div.find(".btnDel").prop("disabled", true);
        },
        "onDrawBegin": function (week, name) {
            $div.timeSegSelect("backup");
            if (getWeekSegNum(week) >= MAX_SEG_NUM) {
                setTimeout(function () {
                    rightPopup(lang.tipSegOverflow);
                }, 1);
                return false;
            }
            return true;
        },
        "onDrawEnd": function (week, name) {
            if (getWeekSegNum(week) > MAX_SEG_NUM) {
                setTimeout(function () {
                    rightPopup(lang.tipSegOverflow);
                }, 1);
                return false;
            }
            return true;
        }
    });
    setEditNumberStyle($(".J-check-type>input"));
    $(".J-close-popup").click(function () {
        $(".J-time-popup-block").hide();
    });

    var checkList = $(".J-check-type");
    var funcGetChkHtml = function (name) {
        return '<label><input type="checkbox" name="' + name + '"/>' + name + '</label>';
    };

    for (var i = 0; i < arrCate.length; i++) { // 循环checkbox选择项
        checkList.append(funcGetChkHtml(arrCate[i].name))
    }
}

/**
 * 判断是否有POE通道
 */
function isPoeEnable() {
    return getDevConf('poeNum') > 0;
}

/**
 * 获取可用通道
 * @param {number} chIdx
 * @returns
 */
function isChEnb(chIdx) {
    return window.top.nSynConfigDatabit[0] == 1 && (!isXVR() || window.top.vChannelConfig[chIdx] != 4);
}

/**
 * 获取支持通道号
 */
function getChannelProtocolType(callback) {
    var username = getUserName();
    var userPwd = getAuth();
    api.newGetCapability(REQUEST_GET, { username: username }, function (code, data, c) {
        var DateArr = roundOne();
        var type = data.encryptionType[0]
        var strSrcData1 = roundTwo(username, data.param[type].salt, DateArr[0], userPwd);
        var strSrcData2 = reverseRoundThree(strSrcData1);
        var strSrcData3 = roundFour(data.param[type].iterations, strSrcData2);

        strSrcData4 = roundFive(strSrcData3);

        var params = {
            "encryptionType": type,
            "loginName": String(username),
            "datetime": DateArr[1],
            "iv": IV,
        };
        api.channelList(REQUEST_GET, params, function (code, data) {
            var array = data.channelList;
            xvrChannelConfig.osdAndPrivacy = [];
            for (var index = 0; index < array.length; index++) {

                // 可配置osd和隐私遮挡的条件
                if ((array[index].enable == true && array[index].protocolType == "Private") || array[index].protocolType == "Analog") {
                    xvrChannelConfig.osdAndPrivacy[index] = array[index].channel;
                }
            }
            callback && callback(array);
        });
    })
}

/**
 * 获取xvr支持通道号
 */
function getDeviceCapablities(callback) {
    api.getDeviceConf(REQUEST_GET, function (code, data) {
        if (code != CODE_SUCCESS) return;
        setDevConf('analogChannelNum', data.analogChannelNum);
        setDevConf('ipChannelNum', data.ipChannelNum);
        callback && callback();
    });
}

/**
* 版本检测
* @param {*} installVersion 安装版本
* @param {*} currentVersion 当前版本
*/
function comparePluginVersions(installVersion, currentVersion) {
    var install = installVersion.split('.');
    var current = currentVersion.split('.');
    for (var i = 0; i < 4; i++) {
        if (parseInt(install[i]) > parseInt(current[i])) return false;
        if (parseInt(install[i]) < parseInt(current[i])) return true;
    };
    return false;
}

/**
 * 获取预置点数组
 */
function getListArray(num) {
    var length = isXVR() ? OTHER_NODE : NVR_NODE;
    return new Array(num ? num : length);
}

function setSessionSign(label) {
    var key = label + '&' + getStorageItem(USER_AUTH);
    return compile(key);
}

function getSessionInfo(isGetLabel) {
    var val = getStorageItem(AUTH_HEADER + getDeviceVerification()),
        label = val ? uncompile(val).split('&')[0] : USER_ID;
    return isGetLabel ? label : getCookie(label);
}

function getDeviceVerification() {
    return hex_md5(getHost().split('.').join('') + getHttpPort());
}

/**
 * 动态加载js
 * @param {*} url 
 */
function toScript(url, callback, version) {
    var head = document.getElementsByTagName('head')[0],
        num = 0;
    for (var i = 0; i < url.length; i++) {
        var scriptDom = document.createElement('script');
        scriptDom.type = 'text/javascript';
        scriptDom.src = url[i] + version;
        head.appendChild(scriptDom);
        num++
    };
    var interval = setInterval(function () {
        if (num == url.length && window.commonInit) {
            clearInterval(interval);
            callback && callback();
        };
    }, 0);
}

/**
 * 动态加载css
 * @param {*} url 
 */
function toCss(url, version) {
    var head = document.getElementsByTagName('head')[0];
    for (var i = 0; i < url.length; i++) {
        var cssDom = document.createElement('link');
        cssDom.rel = 'stylesheet';
        cssDom.type = 'text/css';
        cssDom.href = url[i] + version;
        head.appendChild(cssDom);
    };
}
