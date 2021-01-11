DMAPP.Config = function (params) {

    var viewModel = {
        title: ko.observable(""),
        serviceURL: ko.observable(""),
        lookupServiceOption: {
            dataSource: [
                { SERVICE: "http://192.168.2.6/DMWebAPINew", DES: "南通正式库" },
                { SERVICE: "http://58.221.237.66:8005/DMWebAPINew", DES: "南通正式库（外网）" },
                { SERVICE: "http://192.168.2.6/DMWebAPINewTest", DES: "南通测试库" },
                { SERVICE: "http://58.221.237.66:8005/DMWebAPINewTest", DES: "南通测试库（外网）" },
                { SERVICE: "http://192.168.2.6/DMWebAPIJY", DES: "金燕正式库" },
                { SERVICE: "http://58.221.237.66:8005/DMWebAPIJY", DES: "金燕正式库（外网）" },
                { SERVICE: "http://192.168.2.6/DMWebAPIJYTEST", DES: "金燕测试库" },
                { SERVICE: "http://58.221.237.66:8005/DMWebAPIJYTEST", DES: "金燕测试库（外网）" },
                { SERVICE: "http://192.168.152.1/DMWebAPI", DES: "US正式库" },
                { SERVICE: "http://66.180.234.58:8005/DMWebAPI", DES: "US正式库（外网）" },
                { SERVICE: "http://localhost:61862/", DES: "开发调试" },
                //{ SERVICE: "http://10.0.1.103/WEBAPI", DES: "开发调试-云" },
                //{ SERVICE: "http://10.192.144.99/DMWebAPI", DES: "IR正式库" },
                //{ SERVICE: "http://dev.trusteem.com:20020/IRCZWEBAPI", DES: "IR开发库" },
            ],
            displayExpr: "DES",
            valueExpr: "SERVICE"
        },
        interval: ko.observable(60),
        viewShown: function () {
            SetLanguage();

            var localStorage = window.localStorage;
            var url = localStorage.getItem("dmappurl");
           
            if (url != null) {
                this.serviceURL(url);
            }
            else {
                url = $("#WebApiServerURL")[0].value;
                this.serviceURL(url);
            }


            var lookup = $("#lookupService").dxLookup("instance");
            lookup.option("value", url);
            var t = localStorage.getItem("workshopIntervalTime");
            if (t&&!isNaN(t)) {
                this.interval(t);
            }

        },
        onSaveClick: function () {
            var lookup = $("#lookupService").dxLookup("instance");
            var url = lookup.option("value");
            this.serviceURL(url);

            var localStorage = window.localStorage;
            localStorage.setItem("dmappurl", this.serviceURL());
            localStorage.setItem("workshopIntervalTime", this.interval());
            $("#WebApiServerURL")[0].value = this.serviceURL();
            DevExpress.ui.notify(SysMsg.saveSuccess, "success", 1000);
        },
        onLogoffClick: function () {
            Logoff();
        },
        onScan: function () {
            try {
                ScanBarcode(this);
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }

        }
    };

    return viewModel;

    function ScanBarcode(viewModel) {
        cordova.plugins.barcodeScanner.scan(
         function (result) {
             if (result.text == null || result.text == "") {
                 return;
             }

             var url = result.text;
             viewModel.serviceURL(url);
             var localStorage = window.localStorage;
             localStorage.setItem("dmappurl", this.serviceURL());
             
             $("#WebApiServerURL")[0].value = this.serviceURL();
             DevExpress.ui.notify(SysMsg.saveFailed, "success", 1000);
         },
         function (error) {
             DevExpress.ui.notify(SysMsg.scanFailed + error, "error", 3000);
         }
      );
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("设置");
            $("#lblAddress").html("服务器地址");
            $("#btnSave").dxButton("instance").option("text", "保存");
            $("#btnLogoff").dxButton("instance").option("text", "注销");
            $("#btnScan").dxButton("instance").option("text", "扫描");
        }
        else {
            viewModel.title("Setting");
            $("#lblAddress").html("Service Address");
            $("#btnSave").dxButton("instance").option("text", "Save");
            $("#btnLogoff").dxButton("instance").option("text", "Logoff");
            $("#btnScan").dxButton("instance").option("text", "Scan");
        }
    }
};