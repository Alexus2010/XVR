var picVariables = {
    selFaceType: 1,
    status: 0,
    imgNodeItems: [],
    imgFaceItems: [],
    faceArrList: [],
    dtName: null,
    timeoutFlag: null,
    minTime: null,
    eventList: null,
    faceList: null,
    searchNum: 10
};
var plugin = window.top.plugin;

function onLoad() {
    eventTypeInit();
    initDot();
    pictureInit();
    eventsOption();
    initCheckList();
    $(".J-smt-face").hide()
}

function onUnload() {
    $(".J-img-list").DataTable().destroy()
}

function eventTypeInit() {
    setTitle(lang.image);
    var a = {};
    var b = {};
    if (isXVR()) {
        a[lang.allchannel] = EVENT_ALL;
        a[lang.picTypeManual] = EVENT_MANUAL;
        a[lang.picTypeMotion] = EVENT_MOTION;
        if (!getConf("isCPUMC6630")) {
            a[lang.smtHumDet] = PICTURE_CAPTURE_HUMAN
        }
    } else {
        a[lang.allchannel] = EVENT_ALL;
        a[lang.picTypeManual] = EVENT_MANUAL;
        a[lang.picTypeMotion] = EVENT_MOTION;
        a[lang.faceDetect] = EVENT_FACE_DETECT;
        a[lang.backPalyCorss] = EVENT_AREA_DETECT;
        a[lang.crossDetect] = EVENT_CROSS_DETECT;
        a[lang.hoverDetect] = EVENT_PEOPLE_STAY_DETECT;
        a[lang.backPalyPeople] = EVENT_PEOPLE_GATHERING_DETECT
    }
    if (isWifiNvr() || isXVR()) {
        a = {};
        a[lang.allchannel] = EVENT_ALL;
        a[lang.picTypeManual] = EVENT_MANUAL;
        a[lang.picTypeMotion] = EVENT_MOTION;
        if (getConf("isCPUMC6630")) {
            a[lang.smtHumDet] = PICTURE_CAPTURE_HUMAN
        }
        $(".J-smt-face").hide()
    }
    if (isCpuEq("CPU_3531D_16AHD_NRT_6168C_X1")) {
        $(".J-similar").attr("def", 86)
    }
    b[lang.blackList] = picVariables.selFaceType;
    b[lang.whiteList] = FACE_TYPE_WHITE;
    b[lang.bwList] = FACE_TYPE_BW;
    b[lang.localUpload] = FACE_TYPE_LOCAL;
    b[lang.faceUpload] = FACE_TYPE_LIB;
    picVariables.eventList = initSelect(a);
    picVariables.faceList = initSelect(b)
}

function pictureInit() {
    $(".J-face-sel").val(FACE_TYPE_BW);
    if (isNVR() && !getDevConf("supportFaceCompare")) {
        toggleOption($(".J-face-sel option").eq(FACE_TYPE_LOCAL - 1), "hide");
        toggleOption($(".J-face-sel option").eq(FACE_TYPE_LIB - 1), "hide")
    }
    $("body").on("dblclick", ".J-img-node img", function() {
        var g = $(this).parents(".J-img-node");
        var h = $.extend({}, $(".J-img-list").DataTable().rows(g.index()).data()[0][5]);
        h.cate && (h.cate = CATE_FULL);
        getPicData(h, function(l) {
            var j = $(".J-div-tab").width(),
                k = $(".J-div-tab").height();
            $(".J-zoom-pic,.J-zoom-closs").removeClass("hide");
            $(".J-zoom-pic img").attr({
                width: j,
                height: k,
                src: l.pictureData
            })
        })
    }).on("dblclick", ".J-lab-pic-pre", function() {
        var g = $(this).parents("tr");
        var h = $.extend({}, $(".J-img-list").DataTable().row(g[0]).data()[5]);
        h.cate && (h.cate = CATE_FULL);
        getPicData(h, function(l) {
            var j = $(".J-div-tab").width(),
                k = $(".J-div-tab").height();
            $(".J-zoom-pic,.J-zoom-closs").removeClass("hide");
            $(".J-zoom-pic img").attr({
                width: j - 20,
                height: k - 20,
                src: l.pictureData
            })
        })
    });
    $(".J-zoom-closs").on("click", function() {
        $(this).parent().addClass("hide")
    });
    $(".J-face-sel").on("change", onFaceTypeChg);
    $("input[name=picSearchType]").on("change", function() {
        if ($(this).prop("checked") && $(this).val() === "smtFaceCmp") {
            $(".J-face-sel").prop("disabled", false);
            $(".J-event-sel").prop("disabled", true)
        } else {
            $(".J-face-sel").prop("disabled", true).change();
            $(".J-event-sel").prop("disabled", false)
        }
    }).eq(0).click();
    setEditNumberStyle($(".J-similar"));
    var d = $("#dlgFace").attr("title", lang.getFaceModel).dialog({
        modal: true,
        autoOpen: false,
        draggable: false,
        width: 800,
        height: 500,
        open: function() {
            $(".J-face-confirm-btn").prop("disabled", true);
            var g = $("#listFaceLib").html("");
            $("#blackFaceImg").html("");
            plugin().getFaceLibs(function(h) {
                for (var j = 0; j < h.length; j++) {
                    var k = $("<li></li>");
                    k.text(h[j]["name"]).data("lib-data", h[j]);
                    g.append(k)
                }
            })
        },
        buttons: [{
            text: lang.confirm,
            "class": "web-btn J-face-confirm-btn",
            click: function() {
                var g = $("#blackFaceImg .J-img-face.select img");
                $(".J-face-img-sel").attr("src", g.attr("src")).data("token", g.data("token")).data("libName", g.data("libName"));
                d.dialog("close")
            }
        }, {
            text: lang.cancel,
            "class": "dis",
            click: function() {
                d.dialog("close")
            }
        }]
    });
    $("body").on("click", "#listFaceLib li", function() {
        var g = new Date().getTime();
        if (g - picVariables.minTime < 100) {
            return
        }
        $_this = $(this);
        if (picVariables.timeoutFlag != null) {
            clearTimeout(picVariables.timeoutFlag)
        }
        picVariables.timeoutFlag = setTimeout(function() {
            loading(true);
            $("#listFaceLib li").removeClass("select");
            $($_this).addClass("select");
            $(".J-face-confirm-btn").prop("disabled", true);
            $("#blackFaceImg").html("");
            var j = $($_this).data("lib-data");
            picVariables.dtName = j.name;
            var h = $(".blackInfo").text(lang.nums + " " + 0);
            plugin().getFaceListFromLib(j.name, j.id, function(l) {
                picVariables.faceArrList = l;
                var m = l.length;
                h.text(lang.nums + " " + m);
                for (var k = 0; k < m; k++) {
                    $("#blackFaceImg").append('<div class="img-face J-img-face"> <img src=""> </div>')
                }
                $("#blackFaceImg").scroll();
                loading(false)
            })
        }, 50);
        picVariables.minTime = g
    }).on("click", "#blackFaceImg .J-img-face", function() {
        $("#blackFaceImg .J-img-face").removeClass("select");
        $(this).addClass("select");
        $(".J-face-confirm-btn").prop("disabled", false)
    });
    var c = $("#blackFaceImg");
    var a = c.position().top;
    c.scroll(".J-img-face", throttle(function() {
        var g = c.find(".J-img-face");
        var j = c.scrollTop();
        var n = c.height();
        var r = g.outerHeight() + ParseInt(g.css("margin-top")) * 2,
            h = g.outerWidth() + ParseInt(g.css("margin-right")) * 2;
        var m = a - r,
            k = n + a;
        var p = Math.floor(j / r) * Math.floor(c.width() / h);
        for (var l = p < 0 ? 0 : p; l < g.length; ++l) {
            var o = g.eq(l);
            if (o.hasClass("img-loading") || o.hasClass("img-loaded")) {
                continue
            }
            var q = o.position().top;
            if (q < m) {
                continue
            } else {
                if (q > k) {
                    break
                }
            }
            picVariables.imgFaceItems.push({
                "$this": o,
                di: picVariables.faceArrList[l],
                name: picVariables.dtName
            });
            o.addClass("img-loading")
        }
        queueFaceImg(picVariables.imgFaceItems.shift())
    }, 1000, 500));
    var e = new Date();
    e.setHours(0);
    e.setMinutes(0);
    e.setSeconds(0);
    var f = {
        dateFormat: "yy-mm-dd",
        timeFormat: "HH:mm:ss",
        showSecond: false,
        changeYear: true,
        changeMonth: true
    };
    $(".J-begin-time").datetimepicker(f).datetimepicker("setDate", e);
    $(".J-end-time").datetimepicker(f).datetimepicker("setDate", new Date());
    $(".J-table-check-all").on("change", function() {
        var g = $(this).prop("checked");
        $(".J-check-pic").prop("checked", g);
        $(".J-download-btn").prop("disabled", !g)
    });
    $("table").on("change", ".J-check-pic", function() {
        var g = $(this).parents(".J-img-list").find(".J-check-pic");
        $(isGridMode() ? ".J-grid-check-all" : ".J-table-check-all").prop("checked", g.not(":checked").length === 0);
        $(".J-download-btn").prop("disabled", g.filter(":checked").length === 0)
    });
    $(".J-grid-list").on("change", ".J-img-con input", function() {
        var h = $(this).parents(".J-grid-list").find(".J-check-pic");
        var g = h.filter(":checked").length === 0;
        $(".J-download-btn").prop("disabled", g)
    });
    $(document).on("click", ".fg-button.ui-state-default", function() {
        $(".J-table-check-all,.J-check-pic").prop("checked", false)
    });
    $("body").on("change", ".J-ipt-pic-name", function() {
        var l = $(this);
        var n = l.val();
        var g = fillterFileName(n);
        var k = g.substr(-3);
        var m, j = $(".J-img-list").DataTable();
        if (isGridMode()) {
            m = j.row(ParseInt(l.parents(".J-img-node").index())).data()
        } else {
            m = j.row(l.parents("tr")[0]).data()
        }
        var h = m[5];
        if (k !== h.ptype) {
            g += "." + h.ptype
        }
        if (n !== g) {
            l.val(g);
            m[2] = g
        }
    });
    $("body").on("hover", ".J-lab-pic-pre", function(h) {
        var g = $(this);
        if (picVariables.timeoutFlag != null) {
            clearTimeout(picVariables.timeoutFlag)
        }
        picVariables.timeoutFlag = setTimeout(function() {
            if (h.type === "mouseover") {
                emptyImg($(".J-img-preview,.J-img-preview2"));
                $(".J-div-img-preview").removeClass("hide").position({
                    at: "left",
                    of: g,
                    my: "right"
                });
                var l = $(".J-img-list").DataTable().row(g.parents("tr")[0]).data();
                var j = $(".J-div-img-preview").attr("idx", l[0]);
                var k = isEvtType();
                var m = getFaceType();
                getPicData(l[5], function(n) {
                    if (l[0] != j.attr("idx")) {
                        return
                    }
                    $(".J-img-preview").attr("src", n.pictureData);
                    if (!k && m != FACE_TYPE_LOCAL && m != FACE_TYPE_LIB && n.pictureData) {
                        $(".J-img-preview2").attr("src", n.pictureData)
                    } else {
                        if (m == FACE_TYPE_LOCAL) {
                            $(".J-img-preview2").attr("src", $(".J-local-img-sel").attr("src"))
                        } else {
                            if (m == FACE_TYPE_LIB) {
                                $(".J-img-preview2").attr("src", $(".J-face-img-sel").attr("src"))
                            }
                        }
                    }
                })
            } else {
                $(".J-div-img-preview").addClass("hide").attr("idx", -1)
            }
        }, 150)
    });
    $(".J-pic-view").on("click", onShowTypeChg);
    $(".J-grid-check-all").on("change", function() {
        var g = $(this).prop("checked");
        $(".J-grid-list input[type=checkbox]").prop("checked", g);
        $(".J-download-btn").prop("disabled", !g)
    });
    $("body").on("change", ".J-grid-list input[type=checkbox]", function() {
        $(".J-grid-check-all").prop("checked", $(".J-grid-list input[type=checkbox]").not(":checked").length === 0)
    });
    var b = $(".J-grid-list");
    var a = b.position().top;
    b.scroll(".J-img-node", throttle(function() {
        var n = $(".J-img-list").DataTable().data();
        var l = !isEvtType();
        var g = b.find(".J-img-node");
        var k = b.scrollTop();
        var p = b.height();
        var t = g.outerHeight() + ParseInt(g.css("margin-top")) * 2,
            h = g.outerWidth() + ParseInt(g.css("margin-right")) * 2;
        var o = a - t,
            j = p + a;
        var r = Math.floor(k / t) * Math.floor(b.width() / h);
        for (var m = r < 0 ? 0 : r; m < g.length; ++m) {
            var q = g.eq(m);
            if (q.hasClass("img-loading") || q.hasClass("img-loaded")) {
                continue
            }
            var s = q.position().top;
            if (s < o) {
                continue
            } else {
                if (s > j) {
                    break
                }
            }
            picVariables.imgNodeItems.push({
                "$this": q,
                di: n[m],
                dbImg: l
            });
            q.addClass("img-loading")
        }
        queueImg(picVariables.imgNodeItems.shift())
    }, 1000, 500));
    getConf("isCPUMC6630") && $(".J-smt-face").hide();
    setTimeout(function() {
        initPicTable()
    }, 10)
}

function initPicTable() {
    var a = {
        columnDefs: [{
            targets: 0,
            orderable: false,
            render: function(d, c, b, e) {
                return '<span class="img-row"><label class="lab-fill-width"><input type="checkbox" class="J-check-pic">' + (d + 1) + "</label></span>"
            }
        }, {
            targets: 1
        }, {
            targets: 2,
            render: function(d, c, b, e) {
                if (c === "sort" || c === "type") {
                    return d
                }
                return '<input type="text" class="ipt-pic-name J-ipt-pic-name" value="' + d + '" />'
            }
        }, {
            targets: 3
        }, {
            targets: 4,
            orderable: false
        }, {
            targets: 5,
            orderable: false,
            render: function(d, c, b, e) {
                return '<label class="lab-fill-width pointer J-lab-pic-pre" title="' + lang.dbclkZoomin + '"><span class="ui-icon ui-icon-circle-zoomin"></span></label>'
            }
        }],
        order: [0, "asc"],
        scrollY: $(".J-div-tab").height() - 200,
        searching: false,
        bPaginate: false,
        paging: true,
        oLanguage: {
            oPaginate: {
                sPrevious: "<",
                sNext: ">"
            },
            sEmptyTable: lang.tipNoPic
        }
    };
    initSimpleTable($(".J-img-list"), a)
}

function queueImg(a) {
    if (a) {
        loadGridImg(a.$this, a.di, a.dbImg, function() {
            return queueImg(picVariables.imgNodeItems.shift())
        })
    }
}

function queueFaceImg(a) {
    if (a) {
        loadFaceImg(a.$this, a.di, a.name, function() {
            return queueFaceImg(picVariables.imgFaceItems.shift())
        })
    }
}

function loadGridImg(e, d, b, h) {
    var g = e.index();
    var a = e.find("img");
    if (b) {
        var j = getFaceType();
        plugin().getPicBase64(d[5], function(m, l) {
            if (j == FACE_TYPE_LOCAL) {
                var k = $(".J-local-img-sel").attr("src")
            } else {
                if (j == FACE_TYPE_LIB) {
                    var k = $(".J-face-img-sel").attr("src")
                }
            }
            m && a.eq(0).attr("src", m).attr("title", lang.dbclkZoomin);
            (j == FACE_TYPE_LOCAL || j == FACE_TYPE_LIB) ? k && a.eq(1).attr("src", k).attr("title", lang.dbclkZoomin): l && a.eq(1).attr("src", l).attr("title", lang.dbclkZoomin);
            e.removeClass("img-loading").addClass("img-loaded");
            h()
        });
        if (j == FACE_TYPE_LOCAL) {
            a.eq(1).attr("src", $(".J-local-img-sel").attr("src"))
        } else {
            if (j == FACE_TYPE_LIB) {
                a.eq(1).attr("src", $(".J-face-img-sel").attr("src"))
            }
        }
    } else {
        var c;
        var f = window.URL || window.webkitURL;
        getPicData(d[5], function(k) {
            if (k) {
                if (isIE9()) {
                    a.attr("src", k.pictureData).attr("title", lang.dbclkZoomin);
                    e.removeClass("img-loading").addClass("img-loaded");
                    h()
                } else {
                    if (c) {
                        f.revokeObjectURL(c)
                    }
                    var l = convertDataURIToBlob(k.pictureData);
                    c = f.createObjectURL(l);
                    a.attr("src", c).attr("title", lang.dbclkZoomin);
                    e.removeClass("img-loading").addClass("img-loaded");
                    h()
                }
            }
        })
    }
}

function loadFaceImg(d, b, a, e) {
    var c = new Array();
    plugin().getFacePic(b.token, a, function(g, f, h) {
        c.push(f);
        d.find("img").data("token", f).data("libName", h).attr("src", g);
        d.removeClass("img-loading").addClass("img-loaded");
        e();
        loading(false)
    })
}

function onShowTypeChg() {
    if ($(this).hasClass("select")) {
        return
    }
    $(".J-pic-view").toggleClass("select");
    $(".J-table-check-all,.J-grid-check-all").prop("checked", false).change();
    if ($(this).hasClass("icon-list")) {
        $(".J-div-tab .J-table-block").show();
        $(".J-grid-block").hide();
        $(".J-img-list").DataTable().draw()
    } else {
        $(".J-grid-block").show();
        var c = $(".J-div-tab .J-table-block");
        var a = c.height();
        c.hide();
        $(".J-grid-list").css("height", a).show().find(".J-grid-list").css("height", a - $(".J-grid-list .J-grid-head").height());
        var b = $(".J-img-list").DataTable();
        if ($(".J-grid-list .J-img-node").length !== b.data().length) {
            initGridList(b)
        }
    }
}

function calImgNodeWidth(d) {
    d || (d = $(".J-grid-list"));
    var c = 140;
    var j = 200;
    if (isEvtType()) {
        c = 90;
        j = 300
    }
    var g = j + c;
    var b = d.width();
    var f = b / g;
    var e = Math.floor(f);
    if (e === 0) {
        return j
    }
    var h = f - e;
    var a = ParseInt((g * h) / e);
    if (a > 100) {
        a = ParseInt(j * (1 - h) / e);
        return j - a
    } else {
        return j + a
    }
}

function resetImgNodeWidth() {
    var b = $(".J-grid-list");
    var a = calImgNodeWidth(b);
    $(".J-img-node .J-img-con img").css("width", a + "px")
}

function initGridList(e) {
    var b = $(".J-grid-list");
    b.html("");
    var d = e.data();
    var a = calImgNodeWidth(b);
    if (isEvtType()) {
        for (var c = 0; c < d.length; c++) {
            b.append('<div class="img-node J-img-node">                <div class="img-container J-img-con"><span class="img-no"><input type="checkbox" class="J-check-pic">' + (c + 1) + '.</span><img style="width:' + a + 'px;" src=""></div>                <div><label>' + lang.dl2 + ":</label><span>" + d[c][4] + "</span></div>                <div><label>" + lang.yyPatrolTime + ':</label><span class="iptTime">' + d[c][3] + "</span></div>                <div><label>" + lang.dl1 + ':</label><input type="text" class="ipt-pic-name J-ipt-pic-name" value="' + $(e.row(c).node()).find(".J-ipt-pic-name").val() + '"></div>            </div>')
        }
    } else {
        for (var c = 0; c < d.length; ++c) {
            b.append('<div class="img-node J-img-node">                    <div class="img-container J-img-con">                        <span class="img-no"><input type="checkbox" class="J-check-pic">' + (c + 1) + '.</span>                        <img style="width:' + a + 'px" src="">                        <img style="width:' + a + 'px" src="">                    </div>                    <div><label>' + lang.chAbbr + d[c][1] + "</label>&nbsp;&nbsp;<span>" + lang.similarity + ":" + d[c][4] + "</span></div>                    <div><label>" + lang.logTime + ":</label><span>" + d[c][3] + "</span></div>                    <div><label>" + lang.dl1 + ':</label><input type="text" class="ipt-pic-name J-ipt-pic-name" value="' + d[c][2] + '"></div>                </div>')
        }
    }
    isGridMode() && $(".J-grid-list").scroll()
}

function initCheckList() {
    var e = getTotalChannelNum(),
        b = $(".J-aisle-sel-popup"),
        f = b.find(".J-aisle-content"),
        d = "",
        a = [];
    for (var c = 0; c < e; c++) {
        if (window.top.nFileBackupDatabit[c] != 0) {
            d += dotRender("initChannalModule", c)
        } else {
            a.push(0)
        }
    }
    f.html(d);
    if (a.length == window.top.nFileBackupDatabit.length) {
        rightPopup(lang.nolimit);
        return
    }
    $("body").on("change", ".J-aisle-content input", function() {
        $(".J-check-all").prop("checked", $(this).not(":checked").length === 0)
    }).on("change", ".J-check-all", function() {
        $(".J-aisle-content input").prop("checked", $(this).prop("checked"))
    });
    $(".J-aisle-list").on("click", function() {
        $(".J-aisle-sel-popup").show().position({
            of: $(".J-aisle-list"),
            at: "left bottom+4",
            my: "left top"
        });
        if (getCookie("lang") == "jp") {
            $(".J-aisle-sel-popup").addClass("jp-sel-aisle")
        }
    });
    $(".J-aisle-confirm").on("click", function() {
        var h = [],
            g = [];
        $(".J-aisle-content input:checked").each(function() {
            g.push(ParseInt($(this).val()));
            h.push($(this).parent().text())
        });
        var j = h.join(",");
        $(".J-aisle-list").val(j).attr("title", j).data("selCh", g);
        b.hide()
    });
    $(".J-aisle-cancel").on("click", function() {
        b.hide()
    });
    $(".J-aisle-content input").eq(0).prop("checked", true);
    $(".J-aisle-content input").trigger("change");
    $(".J-aisle-confirm").trigger("click")
}

function getFaceType() {
    return $(".J-face-sel").val()
}

function getEvtType() {
    if ($("[name=picSearchType]:checked").val() === "smtEvtCmp") {
        return $(".J-event-sel").val()
    }
    if ($("[name=picSearchType]:checked").val() === "smtFaceCmp") {
        return 2048
    }
}

function isEvtType() {
    return $("[name=picSearchType]:checked").val() === "smtEvtCmp"
}

function isFaceCmp() {
    return $("[name=picSearchType]:checked").val() === "smtFaceCmp"
}

function getSelCh() {
    var b = $(".J-aisle-list").data("selCh");
    var d = 0,
        a = 0;
    for (var c = 0; c < b.length; c++) {
        if (b[c] > 31) {
            d |= (1 << b[c] - 31)
        } else {
            a |= (1 << b[c])
        }
    }
    return (new Long(a, d, true)).toBytesLE()
}

function ensureChSel() {
    if (!$(".J-aisle-list").val()) {
        rightPopup(lang.upgradeTips1);
        return false
    }
    return true
}

function onBtnSearchClk() {
    var f = new Date($(".J-begin-time").val().replace(/-/g, "/"));
    var d = new Date($(".J-end-time").val().replace(/-/g, "/"));
    var j = "/statics/img/loading.gif";
    if (f > d) {
        rightPopup(lang.setTimeTips2);
        return
    }
    if ($(".J-face-sel").val() == FACE_TYPE_LOCAL && $(".J-local-img-sel").attr("src") != j) {
        if (parseInt(picVariables.status)) {
            rightPopup(lang.ExtractFaceTip);
            return
        }
    }
    if (!$(".J-aisle-list").val()) {
        rightPopup(lang.upgradeTips1);
        return
    }
    loading(true);
    var g = (new Date()).getTimezoneOffset() * 60000;
    var m = {};
    var e = $(".J-img-list").DataTable();
    e.clear().draw();
    initGridList(e);
    $(".J-table-check-all,.J-grid-check-all").prop("checked", false);
    var c = (f.getTime() - f.getTimezoneOffset() * 60000) / 1000,
        a = (d.getTime() - d.getTimezoneOffset() * 60000) / 1000;
    if (isEvtType()) {
        $(".J-div-tab").removeClass("mode-face").addClass("mode-event");
        $(".J-div-img-preview").removeClass("mode-face")
    } else {
        $(".J-div-img-preview").addClass("mode-face");
        $(".J-div-tab").removeClass("mode-event").addClass("mode-face");
        var h = {};
        var l = getFaceType();
        if (l == FACE_TYPE_LOCAL || l == FACE_TYPE_LIB) {
            h.imgData = $(l == FACE_TYPE_LOCAL ? ".J-local-img-sel" : ".J-face-img-sel").attr("src");
            if (h.imgData === "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=") {
                rightPopup(lang.uploadFacePic);
                loading(false);
                return
            }
            h.similarity = $(".J-similar").val()
        }
        if ((isXVR() || getConf("isNvrCptPic")) && l == FACE_TYPE_LIB) {
            h.token = $(".J-face-img-sel").data("token");
            h.libName = $(".J-face-img-sel").data("libName")
        }
        if (h.imgData) {
            var k = getLocalImgSize(h.imgData);
            if (k - 10 > 200) {
                loading(false);
                rightPopup(lang.picMax);
                return
            }
        }
    }
    var b = {
        channelList: $(".J-aisle-list").data().selCh,
        pictureType: parseInt(getEvtType()),
        pictureOffset: 0,
        requestNum: 500,
        sortType: "time",
        sortRule: "asc",
        startTime: c + "",
        endTime: a + ""
    };
    api.pictureList(REQUEST_GET, b, function(r, t) {
        if (r != CODE_SUCCESS) {
            return
        }
        var n = t.itemList;
        if (n.length === 0) {
            rightPopup(lang.tipNoPic)
        }
        n.sort(function(v, u) {
            loading(true);
            return v.pictureTime > u.pictureTime ? 1 : -1
        });
        loading(false);
        var s = [];
        for (var p = 0; p < n.length; ++p) {
            var q = n[p];
            var o = getPicName(q, g, m);
            s.push([p, ParseInt(n[p]["channel"]) + 1, o, (new Date(q.pictureTime / 1000 + new Date().getTimezoneOffset() * 60000)).Format("yyyy-MM-dd hh:mm:ss"), (q.pictureSize / KILOBYTE).toFixed(2) + "Kb", q])
        }
        e.rows.add(s);
        if (isGridMode()) {
            initGridList(e)
        } else {
            e.draw()
        }
    })
}

function getTcpTimeout() {
    var a = getTotalChannelNum();
    if (isXVR() || getDevConf("supportFaceCompare")) {
        return 59000
    }
    if (a > 36) {
        return 20000
    }
}

function getLocalImgSize(d) {
    var e = d.replace("data:image/jpeg;base64,", "");
    var b = e.length;
    var c = parseInt(b - (b / 8) * 2);
    var a = "";
    a = (c / KILOBYTE).toFixed(2);
    return parseInt(a)
}

function getPicName(j, a, h) {
    var g = new Date(j.pictureTime / 1000 + new Date().getTimezoneOffset() * 60000);
    var b = ("0" + (ParseInt(j.channel) + 1)).substr(-2) + "_" + (j.pictureType ? (("000" + j.pictureType).substr(-4) + "_") : "") + g.Format("yyyy-MM-dd_hh-mm-ss");
    var e = j.pictureType + ".jpg";
    var f = b + e;
    var c = 1;
    while (h && h[f]) {
        f = b + "_" + c + e;
        ++c
    }
    h[f] = true;
    return f
}

function isGridMode() {
    return $(".J-pic-view.select").hasClass("icon-grid")
}

function onDownloadClk() {
    var l = isGridMode() ? $(".J-grid-list [type='checkbox']:checked") : $(".J-img-list .J-check-pic:checked");
    if (l.length === 0) {
        rightPopup(lang.dl15);
        return
    }
    downloadList = l;
    var b;
    var k = window.URL || window.webkitURL;
    var m = (new Date()).getTimezoneOffset() * 60000;
    var f = [];
    var e = [];
    if (isGridMode()) {
        for (var g = 0; g < l.length; ++g) {
            var j = l.eq(g).parents(".J-img-node");
            var a = $(".J-img-list").DataTable().row(j.index()).data();
            a[5]["expName"] = a[2];
            f.push(a[5])
        }
    } else {
        for (var g = 0; g < l.length; ++g) {
            var h = l.eq(g).parents("tr").eq(0);
            var a = $(".J-img-list").DataTable().row(h[0]).data();
            a[5]["expName"] = a[2];
            f.push(a[5])
        }
    }
    cbLength = f.length;
    for (var g = 0; g < f.length; g++) {
        if (f[g].pictureTime == "") {
            cbLength--
        }
    }
    var c = counter(cbLength, function() {
        for (var o = 0; o < e.length; o++) {
            var n = o;
            var p = e[o]["pictureData"];
            (function(q, t, r) {
                setTimeout(function() {
                    if (isIE()) {
                        var s = convertDataURIToBlob(t);
                        window.navigator.msSaveBlob(s, f[q].expName)
                    } else {
                        if (b) {
                            k.revokeObjectURL(b)
                        }
                        var v = convertDataURIToBlob(t);
                        b = k.createObjectURL(v);
                        var u = document.createElement("a");
                        u.download = f[q].expName;
                        u.href = b;
                        document.body.appendChild(u);
                        u.click();
                        document.body.removeChild(u)
                    }
                }, r * 500)
            })(n, p, o)
        }
    });
    for (var g = 0; g < f.length; g++) {
        if (f[g].channel == "" && f[g].channel != 0) {
            continue
        }
        var d = {
            channel: parseInt(f[g].channel),
            pictureType: parseInt(f[g].pictureType),
            pictureTime: f[g].pictureTime
        };
        api.picture(REQUEST_GET, d, function(n, o) {
            if (n != CODE_SUCCESS) {
                return
            }
            o.pictureData = "data:image/jpeg;base64," + o.pictureData;
            e.push(o);
            c()
        })
    }
    loading(false)
}

function onPickImgClk() {
    if (isEvtType()) {
        return
    }
    xvr.getPlayBackStatus(function(b, d) {
        if (b != HTTP_OK) {
            rightPopup(lang.optionexception);
            return
        }
        var c = splitOkVal(d);
        picVariables.status = c.getpbstatus
    });
    var a = plugin().brwoseFileName(3);
    if (a) {
        $(".J-local-img").val(a);
        plugin().getPicBase64({
            localPic: a
        }, function(b) {
            $(".J-local-img-sel").attr("src", b)
        })
    }
}

function onSelFaceClk() {
    if (isEvtType()) {
        return
    }
    $("#dlgFace").dialog("open")
}

function onFaceTypeChg() {
    var b = $(".J-group-img,.J-group-face");
    b.hide();
    var a = $(this).val();
    if (a == FACE_TYPE_LOCAL) {
        emptyImg(b.filter(".J-group-img").show().find("input").not(".J-similar").val("").end().find("img"))
    } else {
        if (a == FACE_TYPE_LIB) {
            emptyImg(b.filter(".J-group-face").show().find("img"))
        }
    }
}

function convertDataURIToBlob(b) {
    if (!b) {
        return
    }
    var c = ";base64,";
    var e = b.indexOf(c) + c.length;
    var a = b.substring(e);
    a = a.replace(/\r\n/g, "");
    var d = window.atob(a);
    var f = d.length;
    var g = new Uint8Array(new ArrayBuffer(f));
    for (i = 0; i < f; i++) {
        g[i] = d.charCodeAt(i)
    }
    return new Blob([g], {
        type: "image/jpeg"
    })
}

function fillterFileName(a) {
    return a.replace(/[\\\/:\*\?\"<>|"]/g, "")
}

function throttle(a, b, e) {
    var d, c = new Date();
    return function() {
        var g = this,
            f = arguments,
            h = new Date();
        clearTimeout(d);
        if (h - c >= e) {
            a.apply(g, f);
            c = h
        } else {
            d = setTimeout(a, b)
        }
    }
}

function initSelect(c) {
    var a = [];
    for (var b in c) {
        a.push({
            val: c[b],
            name: b
        })
    }
    return a
}

function eventsOption() {
    $(".J-pick-img").on("click", function() {
        onPickImgClk();
        return false
    });
    $(".J-sel-face-clk").on("click", function() {
        onSelFaceClk();
        return false
    });
    $(".J-download-btn").click(function() {
        onDownloadClk();
        return false
    });
    $(".J-search-btn").on("click", function() {
        if (picVariables.timeoutFlag != null) {
            clearTimeout(picVariables.timeoutFlag)
        }
        picVariables.timeoutFlag = setTimeout(function() {
            onBtnSearchClk()
        }, 250);
        return false
    })
}

function getPicData(a, c) {
    var b = {
        channel: parseInt(a.channel),
        pictureType: parseInt(a.pictureType),
        pictureTime: a.pictureTime
    };
    api.picture(REQUEST_GET, b, function(d, e) {
        if (d != CODE_SUCCESS) {
            return
        }
        e.pictureData = "data:image/jpeg;base64," + e.pictureData;
        c && c(e)
    })
};