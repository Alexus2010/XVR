(function () {
    // 视频渲染模块
    function pluginModel(it) {
        var html = isMacOS() ? '<div class="plugin-block J-plugin-block">' 
                                : '<div class="plugin-block J-plugin-block"><a class="hide J-down-tip down-tip">' + (lang.download) + '</a>';
        if (it.mode == PLAY_MODE_H264) {
            html += '<video id="v264" class="v264 auto-fill" muted></video>';
        } else if (it.mode == PLAY_MODE_H265) {
            html += '<canvas id="c265" class="c265" muted></canvas>';
        } else if (true) {
            if (it.isWin) {
                html += '<object id="plugin" type=\'application/x-lsnvrnetclient\'> <param name="onload" value="pluginLoaded"/></object>';
            } else if (true) {
                html += '<object id="plugin" type=\'application/x-lsvrmacnetclientctl\'> <param name="onload" value="pluginLoaded"/></object>';
            }
        }
        html += '<canvas class="draw-box" id="canvasEnlarge"></canvas></div>';
        return html;
    }

    // 表单模块
    function formSelectModel(it) {
        var html = '<select ';
        if (it.attr) {
            for (var k in it.attr) {
                html += ' ' + (" " + k + "='" + it.attr[k] + "'") + ' ';
            }
        }
        html += '> ';
        var arr1 = it.list;
        if (arr1) {
            var item, idx = -1, l1 = arr1.length - 1;
            while (idx < l1) {
                item = arr1[idx += 1];
                html += ' ';
                var itype = typeof item;
                html += ' ';
                if (itype === "object") {
                    html += ' <option value="' + (item.val) + '"  ';
                    if (it.nodeAttr) {
                        for (var k in it.nodeAttr) {
                            html += ' ' + (" " + k + "='" + it.nodeAttr[k] + "'") + ' ';
                        }
                    }
                    html += ' ';
                    if (item.attr) {
                        for (var k in item.attr) {
                            html += ' ' + (" " + k + "='" + item.attr[k] + "'") + ' ';
                        }
                    }
                    html += '>' + (item.name) + '</option> ';
                } else if (itype === "string") {
                    html += ' <option value="' + (idx) + '"  ';
                    if (it.nodeAttr) {
                        for (var k in it.nodeAttr) {
                            html += ' ' + (" " + k + "='" + it.nodeAttr[k] + "'") + ' ';
                        }
                    }
                    html += '>' + (item) + '</option> ';
                } else if (true) {
                    html += ' <option value="' + (item) + '"  ';
                    if (it.nodeAttr) {
                        for (var k in it.nodeAttr) {
                            html += ' ' + (" " + k + "='" + it.nodeAttr[k] + "'") + ' ';
                        }
                    }
                    html += '>' + (item) + '</option> ';
                }
                html += ' ';
            }
        }
        html += '</select> ';
        return html;
    }

    function formOptionModel(it) {
        var html = '';
        var array = it.list
        for (var i = 0; i < array.length; i++) {
            var value = it.default ? it.default[i] : array[i];
            html += '<option value="' + (array[i]) + '">' + (value) + '</option>';
        }
        return html;
    }

    function formRadioModel(it) {
        var html = '<input type="radio" ';
        if (it.attr) {
            html += ' ' + (it.attr) + ' ';
        }
        html += '><label>' + (it.name) + ' </label>';
        return html;
    }

    // tab菜单
    function tagHeadModel(it) {
        var html = ' <ul class="tag-head"> ';
        var arr1 = it;
        if (arr1) {
            var item, i1 = -1, l1 = arr1.length - 1;
            while (i1 < l1) {
                item = arr1[i1 += 1];
                html += ' <li ';
                if (item.hide) {
                    html += 'class="hide"';
                }
                html += '> <a href="javascript:void(0);"  ';
                if (item.id) {
                    html += 'name="' + (item.id) + '"';
                }
                html += ' ';
                if (item.attr) {
                    html += '' + (item.attr);
                }
                html += '>' + (item.name) + '</a> </li> ';
            }
        }
        html += ' </ul>';
        return html;
    }

    // 下载提示
    function downPluginModel() {
        var html = isMacOS() ? '' : '<label class="plugin-link web-color J-plugin-link hide">' + (lang.download) + '</label>';
        return html;
    }

    // 右下角提示
    function rightPopupModel(it) {
        var html = '<div class="right-popup J-right-popup">' +
            '<div class="header"><label class="color-white">' + (it.header) + '</label></div>' +
            '<div class="body"><label class="color-black">' + (it.content) + '</label></div></div>';
        return html;
    }

    // loading框
    function loadingModel(isSpecial) {
        var className = "J-loading-block";
        isSpecial && (className = "J-special-loading-block");
        var html = '<div class="' + className + '"><div class="mask-background"></div><div class="loading"></div></div>';
        return html;
    }

    // XVR-回放&预览菜单
    function channelMenuModel(it) {
        var html = '', channel = '';
        var list = it[0];
        for (var i = 0; i < list.length; i++) {
            if (list[i] < 9) channel = lang.channel + ' 0' + (Number(list[i]) + 1);
            else channel = lang.channel + ' ' + (Number(list[i]) + 1);
            html += '<li value="' + (list[i]) + '"><a id="play' + (list[i]) + '" class="play" title="' + (lang.play) + '"></a>'
                 + '<a class="channelName">' + (channel) + '</a>';
            if (!it[1])
                html += '<a id="record' + (list[i]) + '" class="record" title="' + (lang.starRecord) + '"></a><a id="stream' + (list[i]) + '" class="stream-btn"></a>'
                    + '<div class="stream-dropdown hide J-stream-dropdown"><p><a class="stream-btn1">' + (lang.mainStream) + '</a></p>'
                    + '<p><a class="stream-btn2">' + (lang.childStream) + '</a></p></div>';
            html += '</li>';
        };
        return html;
    }
    // NVR预览菜单
    function previewChannelMenuModel(it) {
        var html = '', channel = '';
        var list = it[0];
        for (var i = 0; i < list.length; i++) {
            if (list[i] < 9) channel = lang.channel + ' 0' + (Number(list[i]) + 1);
            else channel = lang.channel + ' ' + (Number(list[i]) + 1);
            html += '<li value="' + (list[i]) + '"><a id="play' + (list[i]) + '" class="play" title="' + (lang.play) + '"></a>';
            // 查找出对应通道的预览通道名称
            var channelArr = previewChannelName.filter(function (el) { return el.channel == i });
            var channelName = channelArr.length == 0 ? channel : (channelArr[0].channelName ? channelArr[0].channelName : channel);
            html += '<input class="preview-channelName-input" maxlength="31" value="' + (channelName) + '" id="previewChannelNameInput' + (i) 
                 + '" title="' + (channelName) + '" />';
            html += '<a id="record' + (list[i]) + '" class="record" title="' + (lang.starRecord) + '"></a>'
                 +  '<a id="stream' + (list[i]) + '" class="stream-btn"></a>'
                 + '<div class="stream-dropdown hide J-stream-dropdown"><p><a class="stream-btn1">' + (lang.mainStream) + '</a></p>'
                 + '<p><a class="stream-btn2">' + (lang.childStream) + '</a></p></div>';

            html += '</li>';
        };
        return html;
    }

    function addCanvasModel(it) {
        var html = '';
        for (var i = 0; i < it.num; i++) {
            var className = i == 0 ? 'active' : '';
            html += '<div class="pure-block J-pure-block ' + (className) + '" data-id="' + (i) + '" style="width:' + (it.width) + 'px;height:' + (it.height) + 'px">';
            html += '<div class="block' + (i) + '"><canvas id="c265' + (i) + '" class="c265" muted></canvas></div>';
            html += '<canvas class="draws" id="canvasEnlarge' + (i) + '"></canvas></div>';
        }
        return html;
    }

    // 图片
    function initChannalModule(index) {
        var html = '<label class="pointer"><input type="checkbox" value="' + index + '" />' + lang.chAbbr + (index + 1) + '</label>';
        return html;
    }

    function initRecordType(name) {
        var html = '<label><input type="checkbox" name="' + name + '"/>' + name + '</label>';
        return html;
    }

    function isModule() {
        var html = '';
        return html;
    }

    var itself = isModule, _encodeHTML = (function (doNotSkipEncoded) {
        var encodeHTMLRules = {
            "&": "&#38;",
            "<": "&#60;",
            ">": "&#62;",
            '"': "&#34;",
            "'": "&#39;",
            "/": "&#47;"
        },
            matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
        return function (code) {
            return code ? code.toString().replace(matchHTML, function (m) {
                return encodeHTMLRules[m] || m;
            }) : "";
        };
    }());
    itself.pluginModel = pluginModel;
    itself.formSelectModel = formSelectModel;
    itself.formOptionModel = formOptionModel;
    itself.formRadioModel = formRadioModel;
    itself.tagHeadModel = tagHeadModel;
    itself.downPluginModel = downPluginModel;
    itself.rightPopupModel = rightPopupModel;
    itself.loadingModel = loadingModel;
    itself.channelMenuModel = channelMenuModel;
    itself.previewChannelMenuModel = previewChannelMenuModel;
    itself.initChannalModule = initChannalModule;
    itself.initRecordType = initRecordType;
    itself.addCanvasModel = addCanvasModel;
    if (typeof module !== 'undefined' && module.exports) module.exports = itself; else if (typeof define === 'function') define(function () {
        return itself;
    }); else {
        window = window || {};
        window.module = itself;
    }
}());