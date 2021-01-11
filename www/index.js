window.DMAPP = window.DMAPP || {};
var keepAlive = false;

$(function () {
    DevExpress.devices.current({ platform: "generic" });

    $(document).on("deviceready", function () {
        StatusBar.backgroundColorByHexString("#4F94CD");
        //cordova.plugins.backgroundMode.enable();

        navigator.splashscreen.hide();
        if (window.devextremeaddon) {
            window.devextremeaddon.setup();
        }
        $(document).on("backbutton", function () {
            DevExpress.processHardwareBackButton();
        });

        var uuid = device.uuid;
        deviceid = uuid;

        window.JPush.init();
        window.setTimeout(GetRegistrationID, 1000);

        if (device.platform != "Android") {
            window.JPush.setApplicationIconBadgeNumber(0);
        }

        try {
            window.open = cordova.InAppBrowser.open;
        }
        catch (e) { }
    });


    function GetRegistrationID() {
        window.JPush.getRegistrationID(function (rid) {
            try {
                if (rid == null || rid == "") {
                    var t1 = window.setTimeout(GetRegistrationID, 1000);
                    return;
                }
                pushChn = rid;
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }
        });
    }

    function onNavigatingBack(e) {
        if (e.isHardwareButton && !DMAPP.app.canBack()) {
            e.cancel = true;
            exitApp();
        }

        if (DMAPP.app.currentView != null) {
            var cache = DMAPP.app.viewCache;
            var viewKey = DMAPP.app.currentView.key;
            cache.removeView(viewKey);
        }
        DMAPP.app.currentViewModel = null;
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "android":
                navigator.app.exitApp();
                break;
            case "win":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    if (DeviceLang() == "CHS") {
        DMAPP.app = new DevExpress.framework.html.HtmlApplication({
            namespace: DMAPP,
            layoutSet: DevExpress.framework.html.layoutSets[DMAPP.config.layoutSet],
            navigation: DMAPP.config.navigation,
            commandMapping: DMAPP.config.commandMapping
        });

        SysMsg = chsMsg;
    }
    else {
        DMAPP.app = new DevExpress.framework.html.HtmlApplication({
            namespace: DMAPP,
            layoutSet: DevExpress.framework.html.layoutSets[DMAPP.config.layoutSet],
            navigation: DMAPP.config.navigationEN,
            commandMapping: DMAPP.config.commandMapping
        });

        SysMsg = engMsg;
    }

    DMAPP.app.currentView = null;
    DMAPP.app.on("viewShown", function (e) {
        DMAPP.app.currentView = e.viewInfo;
        var viewModel = e.viewInfo.model;
        if (viewModel.hideLayout == true) {
            $("#layout_header").hide();
            $("#layout_footer").hide();
            $("#layout_viewfooter").hide();
            $("#layout-content").css("top", "0");
        }
        else {
            $("#layout_header").show();
            $("#layout_footer").show();
            $("#layout_viewfooter").show();
            $("#layout-content").css("top", "56px");
        }
    });
    //DMAPP.app.on("navigatingBack", function (e) {
       
    //});

    DMAPP.app.router.register(":view/:id", { view: "Login", id: appVer });
    DMAPP.app.on("navigatingBack", onNavigatingBack);
    DMAPP.app.navigate();



});

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "S+": this.getMilliseconds()
    };

    //因位date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：



    if (/(y+)/.test(fmt)) {
        //第一种：利用字符串连接符“+”给date.getFullYear()+""，加一个空字符串便可以将number类型转换成字符串。

        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {

            //第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。

            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(String(o[k]).length)));
        }
    }
    return fmt;
};


