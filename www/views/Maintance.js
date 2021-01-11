DMAPP.Maintance = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable(""),
        popUserVisible: ko.observable(false),
        popArgu: ko.observable({}),
        viewShown: function () {
            this.title(params.CODE_EQP);
            SetLanguage();
            try {
                GetWinbox(this, params);
                GetMenu(this, params);
            }
            catch (e) {
                DevExpress.ui.notify(SysMsg.noDetail, "error", 1000);
            }
        },
        gridOption: {
            dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
            columnAutoWidth: true,
            columns: [
                { dataField: "SID", caption: "SID", allowEditing: false, allowSorting: false, width: 60 },
                { dataField: "TYPE_OP", caption: "类型", allowEditing: false, allowSorting: false, width: 50},
                { dataField: "EMP_START", caption: "申请人", allowEditing: false, allowSorting: false,width: 90},
                { dataField: "DATE_START", caption: "开始时间", allowEditing: false, allowSorting: false, width: 130, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "DATE_STOP", caption: "结束时间", allowEditing: false, allowSorting: false, width: 130, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "REASON", caption: "原因", allowEditing: false, allowSorting: false},
                { dataField: "CONCLUSION", caption: "结论", allowEditing: false, allowSorting: false },
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            }
        },
        tileViewOption: {
            items: [],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 3,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                var desc;
                if (DeviceLang() == "CHS") {
                    desc = itemData.DESC_CH;
                }
                else {
                    desc = itemData.DESC_EN;
                }
                itemElement.append("<div class=\"ItemDesc\">" + desc +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.CODE_MENU + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.DEVOBJ == "MENU") {
                    this.parentMenu(e.itemData.CODE_MENU);
                    GetMenu(this, params);
                }
                else if (e.itemData.DEVOBJ == "BACK") {
                    this.parentMenu("");
                    GetMenu(this, params);
                }
                else if (e.itemData.DEVOBJ == "COMMAND") {
                    Command(e);
                }
                else if (e.itemData.DEVOBJ == "M_AMD") {
                    OpenAMD();
                }
                else {
                    var view = e.itemData.DEVOBJ + "?NEW=1&DEVPARAM=" + e.itemData.DEVPARAM + "&CODE_EQP=" + params.CODE_EQP;

                    view = view + "&CODE_OP=" + params.CODE_OP;
                    viewModel.popUserVisible(false);
                    DMAPP.app.navigate(view);

                    //viewModel.popArgu(e);
                    //viewModel.popUserVisible(true);
                }
            },
        },
        buttonClick: function (e) {

        },
        onPopCancelClick: function (e) {
            this.popUserVisible(false);
        },
        onPopOKClick: function (e) {
            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var argu = this.popArgu();
            var view = argu.itemData.DEVOBJ + "?NEW=1&DEVPARAM=" + argu.itemData.DEVPARAM + "&CODE_EQP=" + params.CODE_EQP;

            var popUser = $("#txtPopUser").dxTextBox("instance").option("value");
            var popPwd = $("#txtPopPwd").dxTextBox("instance").option("value");
            var popParam = popUser + ";" + popPwd + ";" + argu.itemData.CODE_MENU;
            var postData = {
                userName: u,
                methodName: "EMS.EMS.CheckValid",
                param: popParam
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                async: false,
                cache: false,
                success: function (data, textStatus) {
                    view = view + "&CODE_OP=" + params.CODE_OP;
                    viewModel.popUserVisible(false);
                    DMAPP.app.navigate(view);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    if (xmlHttpRequest.responseText == "NO SESSION") {
                        ServerError(xmlHttpRequest.responseText);
                    }
                    else {
                        DevExpress.ui.notify("无法读取数据", "error", 1000);
                    }
                }
            });
        }
    };

    function SetLanguage() {

        var grid = $("#gridDevice").dxDataGrid("instance");
        if (DeviceLang() == "ENG") {
            grid.columnOption("SID", "caption", "SID");
            grid.columnOption("TYPE_OP", "caption", "OP Type");
            grid.columnOption("EMP_START", "caption", "Apply");
            grid.columnOption("DATE_START", "caption", "Start Time");
            grid.columnOption("DATE_STOP", "caption", "End Time");
            grid.columnOption("REASON", "caption", "Reason");
            grid.columnOption("CONCLUSION", "caption", "Conclusion");
        }

    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod"
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetMaintanceData",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                var grid = $("#gridDevice").dxDataGrid("instance");
                grid.option({
                    dataSource: data
                });

                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify("无法读取数据", "error", 1000);
                }
            }
        });
    }

    function GetMenu(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod"
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetDeviceMenu",
            param: "M_REPJ"
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var tile = $("#tileMenu").dxTileView("instance");
                var items = data;
                if (viewModel.parentMenu() != "") {
                    var back = { CODE_MENU: "SYS_BACK", DESC_CH: SysMsg.goback, DEVOBJ: "BACK", DSPIDX: 99 };
                    items.push(back);
                }

                tile.option("items", items);
                tile.repaint();
                var divP = $("#divP")[0];
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify("无法读取数据", "error", 1000);
                }
            }
        });
    }

    function Command(e) {
        switch (e.itemData.CODE_MENU) {
            case "REP_START": REP_START(); break;
            case "REP_END": REP_END(); break;
            case "REP_RESULT": REP_RESULT(); break;
            case "PRO_MAT1": PRO_MAT1(); break;
            case "PRO_MAT2": PRO_MAT2(); break;
            case "REP_RPSP": REP_RPSP(); break;
            case "REP_RPMD": REP_RPMD(); break;
        }
    }

    function REP_START() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmREP,
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_REP.Start",
                    param: params.CODE_EQP
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
        });
    }

    function REP_END() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmREPFinish,
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_REP.End",
                    param: params.CODE_EQP
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
        });
    }

    function REP_RESULT() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmREPResult,
            buttons: [
                { text: SysMsg.repFin, value: 1, onClick: function () { return 1; } },
                { text: SysMsg.repReturn, value: 2, onClick: function () { return 2; } },
                { text: SysMsg.cancel, value: 0, onClick: function () { return 0; } }
            ]
        });

        closeDialog.show().done(function (dialogResult) {
            var m;
            if (dialogResult == 1) {
                m = "Finish";
            }
            else if (dialogResult == 2) {
                m = "Return";
            }
            else {
                return;
            }

            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var postData = {
                userName: u,
                methodName: "EMS.EMS_REP." + m,
                param: params.CODE_EQP
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                async: false,
                cache: false,
                success: function (data, textStatus) {
                    DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        });
    }

    function PRO_MAT1() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmMAT1,
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_PRO_MAT.Add",
                    param: params.CODE_EQP + ";" + params.CODE_OP
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
        });
    }

    function PRO_MAT2() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmMAT2,
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_PRO_MAT.Replace",
                    param: params.CODE_EQP + ";" + params.CODE_OP
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
        });
    }

    function REP_RPSP() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmREP,
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_REP.StartRPSP",
                    param: params.CODE_EQP
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
        });
    }

    function REP_RPMD() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: SysMsg.confirmREPResult,
            buttons: [{ text: SysMsg.repFin, value: true, onClick: function () { return true; } }, { text: SysMsg.cancel, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == false) {
                return;
            }

            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var postData = {
                userName: u,
                methodName: "EMS.EMS_REP.FinishRPSP",
                param: params.CODE_EQP
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                async: false,
                cache: false,
                success: function (data, textStatus) {
                    DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        });
    }

    function OpenAMD() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_AMD.CreateRandom",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var view = "M_AMD?DEVPARAM=&CODE_EQP=" + params.CODE_EQP;
                view = view + "&CODE_OP=" + params.CODE_OP;
                viewModel.popUserVisible(false);
                DMAPP.app.navigate(view);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });


    }

    return viewModel;
};