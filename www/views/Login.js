DMAPP.Login = function (params) {

    var viewModel = {
        //hideLayout: true,
        title: ko.observable(""),
        versionChecked: ko.observable(false),
        indicatorVisible:ko.observable(false),
        viewShown: function () {
            SetLanguage();
            var localStorage = window.localStorage;

            var url = localStorage.getItem("dmappurl");
            if (url != null && url != "") {
                $("#WebApiServerURL")[0].value = url;
            }

            var img = "url('" + url + "/images/bg.jpg?v=1')";
            var divContent = $("#divContent").css("background-image", img).css("background-size","100% 100%");
            
            //$("#logoImg").attr("src",url+"/logo.png");
            if (keepPopUserInfo == true) {
                var u = localStorage.getItem("username");
                if (u != null) {
                    var p = localStorage.getItem("password");
                    this.username(u);
                    this.password(p);
                }
            }

            if (viewModel.versionChecked() == false) {
                try {
                    $("#appver").text(appVer);
                    //cordova.getAppVersion.getVersionNumber().then(function (version) {
                    //    $("#appver").text("Version: "+appVer);
                    //    CheckUpdate();
                    //});
                }
                catch (e) { }
                
                viewModel.versionChecked(true);
            }
            
            var sessionStorage = window.sessionStorage;
            if(sessionStorage.baiduchn != null)
            {
                this.chn(sessionStorage.baiduchn);
            }
            
            if (sessionStorage.uuid != null)
            {
                this.deviceid(sessionStorage.uuid);
            }
            

        },
        username: ko.observable(""),
        password: ko.observable(""),
        onLoginClick: function () {
            Logon(this,this.username(), this.password());
        },
        onSettingClick: function () {
            DMAPP.app.navigate("Config");
        }
    };

    return viewModel;

    function Logon(viewModel,u, p)
    {
        var serverVer = CheckServerVersion();
        viewModel.indicatorVisible(true);
        var sessionStorage = window.sessionStorage;
        if (sessionStorage.baiduchn != null) {
            viewModel.chn(sessionStorage.baiduchn);
        }

        var devicetype = DevExpress.devices.real().platform;
        var postData = {
            UserName: u,
            Password: p,
            CHN: pushChn,
            DeviceID: deviceid,
            DeviceType: devicetype,
            Lang: DeviceLang(),
            appVer: appVer
        };
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/Logon2";
        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {

                sessionStorage.removeItem("username");
                sessionStorage.setItem("username", u);

                var localStorage = window.localStorage;
                localStorage.setItem("username", u);
                localStorage.setItem("password", p);
                viewModel.indicatorVisible(false);
                var view = appStartView;
                var option = { root: true };
                keepAlive = true;
                KeepAlive();
                GetUserList(u);
                GetUserRoles(u);
                GetSettings(u);
                DMAPP.app.navigate(view, option);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetUserList(u) {
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetUserList?UserName=" + u;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                asUserList = data;
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetSettings(u) {
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetCode_Op",
            param:''
        };

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                settings=data[0]
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetUserRoles(u) {
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetUserRoles";
        var postData = {
            userName: u
        };

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                asRoles = [];
                for (var i = 0; i < data.length; i++) {
                    asRoles.push(data[i].ROLEID);
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }


    function CheckServerVersion()
    {
        var ver = "1";
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetServerVersion";
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            async:false,
            success: function (data, textStatus) {
                ver= data.ver;
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ver= "1";
            }
        });

        return ver;
    }

    function CheckUpdate() {
        var ver = $("#appver").text();
        ver = ver.replace("Version:", "");
        var url = $("#WebApiServerURL")[0].value + "/Api/Debug/CheckAppVersion2?ver=" + ver;
        var currentplatform = DevExpress.devices.real().platform;

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var newver = data.NewVersion;
                if (newver == "1") {
                    var closedDialog;
                    var closedDialog = DevExpress.ui.dialog.custom({
                        title: SysMsg.info,
                        message: SysMsg.newVer,
                        buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
                    });
                    
                    closedDialog.show().done(function (dialogResult) {
                        if (dialogResult == true) {
                            var apkURL = "";
                            if (currentplatform == 'android') {
                                apkURL = $("#WebApiServerURL")[0].value + "/App/DMAPP.apk";
                                window.open(apkURL, '_blank', 'location=yes');
                            }
                            else if (currentplatform == 'ios') {
                                apkURL = "https://itunes.apple.com/us/app/%E4%BC%81%E8%8D%AB%E5%AE%A2%E6%88%B7%E7%AB%AF/id1216043513?mt=8";
                                window.open(apkURL, '_blank', 'location=yes');
                            }
                            return;
                        }
                    });
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function SetLanguage()
    {
        if (DeviceLang() == "CHS") {
            viewModel.title("登录");
            $("#txtUser").dxTextBox("instance").option("placeholder", "请输入用户名");
            $("#txtPwd").dxTextBox("instance").option("placeholder", "请输入密码");
            $("#btnLogin").dxButton("instance").option("text", "登录");
            $("#btnSetting").dxButton("instance").option("text", "设置");
        }
        else {
            viewModel.title("Logon");
            $("#txtUser").dxTextBox("instance").option("placeholder", "Please input user name");
            $("#txtPwd").dxTextBox("instance").option("placeholder", "Please input password");
            $("#btnLogin").dxButton("instance").option("text", "Login");
            $("#btnSetting").dxButton("instance").option("text", "Setting");
        }
    }
};