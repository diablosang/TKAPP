DMAPP.Process = function (params) {
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
        formOption: {
            colCount: 2,
            items: [
                {
                    id: "CODE_EQP",
                    label: { text: "设备编号" },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "CODE_EQP",
                    colSpan: 1
                },
                {
                    id: "STATUS_OP",
                    label: { text: "状态" },
                    editorType: "dxLookup",
                    editorOptions: {
                        readOnly: true,
                        dataSource: (function () {
                            if (DeviceLang() == "CHS") {
                                return [
                                    { IDLINE: 0, DES: "运行" },
                                    { IDLINE: 1, DES: "维护" },
                                    { IDLINE: 2, DES: "维修" },
                                    { IDLINE: 3, DES: "大修" },
                                    { IDLINE: 4, DES: "空闲中" }
                                ];
                            }
                            else {
                                return [
                                    { IDLINE: 0, DES: "Running" },
                                    { IDLINE: 1, DES: "Maintenance" },
                                    { IDLINE: 2, DES: "Repair" },
                                    { IDLINE: 3, DES: "Overhaul" },
                                    { IDLINE: 4, DES: "Free" }
                                ];
                            }
                        })(),
                        displayExpr: "DES",
                        valueExpr: "IDLINE"
                    },
                    dataField: "STATUS_OP",
                    colSpan: 1
                },
                {
                    id: "POSITION",
                    label: { text: "位置" },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "POSITION",
                    colSpan: 2
                }
            ]
        },
        gridOption: {
            dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
            columnAutoWidth: true,
            columns: [
                { dataField: "ID_WO", caption: "工单号", allowEditing: false, allowSorting: false },
                {
                    dataField: "TYPE_OP", caption: "类型", allowEditing: false, allowSorting: false,
                    lookup: {
                        dataSource: (function () {
                            if (DeviceLang() == "CHS") {
                                return [
                                    { IDLINE: "11", DES: "上料" },
                                    { IDLINE: "12", DES: "下料" },
                                    { IDLINE: "13", DES: "辅料添加" },
                                    { IDLINE: "14", DES: "辅料更换" },
                                    { IDLINE: "31", DES: "压力" },
                                    { IDLINE: "32", DES: "主轴转速" },
                                    { IDLINE: "33", DES: "料盘转速" },
                                    { IDLINE: "51", DES: "产品检验" },
                                    { IDLINE: "52", DES: "产品检验结论" },
                                    { IDLINE: "53", DES: "辅料检验" },
                                    { IDLINE: "54", DES: "辅料检验结论" },
                                ];
                            }
                            else {
                                return [
                                    { IDLINE: "11", DES: "Loading" },
                                    { IDLINE: "12", DES: "Unloading" },
                                    { IDLINE: "13", DES: "Add Cut Media" },
                                    { IDLINE: "14", DES: "Change Coolant" },
                                    { IDLINE: "31", DES: "Pressure" },
                                    { IDLINE: "32", DES: "RPMspindle" },
                                    { IDLINE: "33", DES: "RPMturntable" },
                                    { IDLINE: "51", DES: "QC" },
                                    { IDLINE: "52", DES: "QCR" },
                                    { IDLINE: "53", DES: "Cut QC" },
                                    { IDLINE: "54", DES: "Cut QCR" },
                                ];
                            }
                        })(),
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                },
                { dataField: "CODE_ITEM", caption: "零件", allowEditing: false, allowSorting: false },
                { dataField: "DESC_ITEM", caption: "描述", allowEditing: false, allowSorting: false },
                { dataField: "QTY_ORD", caption: "计划数量", allowEditing: false, allowSorting: false },
                { dataField: "DATE_START", caption: "加工时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
            ],
            height: function () {
                return window.innerHeight * 0.6;
            },
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
            baseItemWidth: (window.screen.width / 6)-10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width/3,
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
                    var form = $("#formDevice").dxForm("instance");
                    var formData = form.option("formData");
                    view = view + "&CODE_OP=" + formData.CODE_OP;
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
                    var form = $("#formDevice").dxForm("instance");
                    var formData = form.option("formData");
                    view = view + "&CODE_OP=" + formData.CODE_OP;
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
        var form = $("#formDevice").dxForm("instance");
        if (DeviceLang() == "ENG") {
            form.itemOption("CODE_EQP", "label", { text: "Equipment Code" });
            form.itemOption("STATUS_OP", "label", { text: "Status" });
            form.itemOption("POSITION", "label", { text: "Position" });
        }

        var grid = $("#gridDevice").dxDataGrid("instance");
        if (DeviceLang() == "ENG") {
            grid.columnOption("ID_WO", "caption", "Work Order No");
            grid.columnOption("TYPE_OP", "caption", "OP Type");
            grid.columnOption("CODE_ITEM", "caption", "Item Code");
            grid.columnOption("DESC_ITEM", "caption", "Item Description");
            grid.columnOption("QTY_ORD", "caption", "Planed Quantity");
            grid.columnOption("DATE_START", "caption", "Plan Date");
        }

    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetWinboxDataSimple"
        var postData = {
            userName: u,
            func: "EMS_T_OP",
            group: "GADMIN",
            doc: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                var form = $("#formDevice").dxForm("instance");
                var grid = $("#gridDevice").dxDataGrid("instance");
                for (var i = 0; i < data.length; i++) {
                    if (data[i].IDNUM == "BMAINBLOCK") {
                        form.option("formData", data[i].data[0]);
                        form.repaint();
                    }

                    if (data[i].IDNUM == "BOP") {
                        grid.option({
                            dataSource: data[i].data
                        });

                        grid.repaint();
                    }
                }

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
            param: "M_PRO"
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
        var form = $("#formMain").dxForm("instance");
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
                var form = $("#formDevice").dxForm("instance");
                var formData = form.option("formData");
                view = view + "&CODE_OP=" + formData.CODE_OP;
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