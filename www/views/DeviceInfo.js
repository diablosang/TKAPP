DMAPP.DeviceInfo = function (params) {
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
            itemType: "group",
            onContentReady: function (e) {

            },
            items: [
                {
                    itemType: "group",
                    template: function (data, itemElement) {
                        if (data.formData.IMAGE)
                            itemElement.append("<img src='data:image;base64," + data.formData.IMAGE + "' style='max-height:220px;max-width:250px;' />");
                    },
                    colSpan: 1,
                },
                {
                    itemType: "group",
                    colCount: 2,
                    items: [
                        {
                            id: "CODE_EQP",
                            label: { text: SysMsg.wlh },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "CODE_EQP",
                            colSpan: 2,
                        },
                        {
                            id: "CODE_OP",
                            label: { text: SysMsg.codeop },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "CODE_OP",
                            colSpan: 1,
                        },
                        {
                            id: "STATUS_OP",
                            label: { text: SysMsg.status },
                            dataField: "STATUS_OP",
                            template: function (data, itemElement) {
                                itemElement.append("<input style='width:80%' class='dx-texteditor-input status_op_" + data.editorOptions.value + "' type='text' readonly='true' aria-readonly='true' spellcheck='false' role='textbox' tabindex='0' name='STATUS_OP' value='" + StatusEnum(data.editorOptions.value) + "' aria-required='false'><div id='status_icon' name='" + data.editorOptions.value + "' style='width: 20%;float: right;line-height: 34px;text-align: center;background-color: #879c85!important;border-radius: 5px;'><i class='dx-icon dx-icon-" + (data.editorOptions.value == 5 ? 'arrowdown': 'arrowup') + "'></i></div>");
                            }
                        },
                        {
                            id: "NAME_EQP",
                            label: { text: SysMsg.deviceName },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "NAME_EQP",
                            colSpan: 2,
                        },
                        {
                            id: "SPEC_EQP",
                            label: { text: SysMsg.spec },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "SPEC_EQP",
                            colSpan: 2,
                        },
                        {
                            id: "MODEL_EQP",
                            label: { text: SysMsg.model },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "MODEL_EQP",
                            colSpan: 2,
                        },
                        {
                            itemType: "button",
                            label: { text: SysMsg.document },
                            dataField: "CODE_DOC",
                            template: function (data, itemElement) {
                                if (data.editorOptions.value) {
                                    var u = sessionStorage.getItem("username");
                                    var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/DownloadFile?UserName=" + u + "&FILEID=" + data.editorOptions.value;
                                    $.ajax({
                                        type: 'GET',
                                        url: url,
                                        cache: false,
                                        success: function (data, textStatus) {
                                            var furl = $("#WebApiServerURL")[0].value + "/Asapment/Temp/" + data.file;
                                            itemElement.append("<a href='" + furl + "' target='_blank'>" + data.file + "</a>");
                                        },
                                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                                        }
                                    });
                                }
                            }
                        }
                    ]
                },
                {
                    id: "DESC_DISP1",
                    label: { text: SysMsg.wlh },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "DESC_DISP1",
                    colSpan: 2
                },
                {
                    id: "DESC_DISP3",
                    label: { text: SysMsg.woid },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "DESC_DISP3",
                    colSpan: 2
                },
                {
                    id: "DESC_DISP5",
                    label: { text: SysMsg.czr },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "DESC_DISP5",
                    colSpan: 2
                },
                {
                    id: "DESC_DISP4",
                    label: { text: SysMsg.gzsj },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "DESC_DISP4",
                    colSpan: 2
                },
                {
                    id: "DESC_DISP7",
                    label: { text: SysMsg.remark },
                    editorOptions: {
                        readOnly: true
                    },
                    dataField: "DESC_DISP7",
                    colSpan: 2
                }
            ]
        },
        tileViewOption: {
            items: [],
            direction: 'vertical',
            height:"100%",
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
            onItemClick: function(e){
                if (e.itemData.DEVOBJ == "MENU"){
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
        onPopCancelClick:function(e){
            this.popUserVisible(false);
        },
        onPopOKClick: function (e) {
            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var argu = this.popArgu();
            var view = argu.itemData.DEVOBJ + "?NEW=1&DEVPARAM=" + argu.itemData.DEVPARAM + "&CODE_EQP=" + params.CODE_EQP;

            var popUser = $("#txtPopUser").dxTextBox("instance").option("value");
            var popPwd = $("#txtPopPwd").dxTextBox("instance").option("value");
            var popParam = popUser + ";" + popPwd+";"+argu.itemData.CODE_MENU;
            var postData = {
                userName: u,
                methodName: "EMS.EMS.CheckValid",
                param: popParam
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                async:false,
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
        if (grid&&DeviceLang() == "ENG") {
            grid.columnOption("ID_WO", "caption", "Work Order No");
            grid.columnOption("TYPE_OP", "caption", "OP Type");
            grid.columnOption("CODE_ITEM", "caption", "Item Code");
            grid.columnOption("DESC_ITEM", "caption", "Item Description");
            grid.columnOption("QTY_ORD", "caption", "Planed Quantity");
            grid.columnOption("DATE_START", "caption", "Plan Date");
        }

    }

    function StatusEnum(num) {
        var list = [];
        if (DeviceLang() == "CHS") {
            list= [
                { IDLINE: 0, DES: "运行" },
                { IDLINE: 7, DES: "待修审" },
                { IDLINE: 2, DES: "待维修" },
                { IDLINE: 3, DES: "磨修" },
                { IDLINE: 4, DES: "空闲中" }
            ];
        }
        else {
            list= [
                { IDLINE: 0, DES: "Running" },
                { IDLINE: 7, DES: "Maintenance" },
                { IDLINE: 2, DES: "Repair" },
                { IDLINE: 3, DES: "Overhaul" },
                { IDLINE: 4, DES: "Free" }
            ];
        }
        var s = list.filter(function (x) {
            return x.IDLINE == num;
        });
        if (s.length > 0)
            return s[0].DES;
        else
            return "none";
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
                }
                viewModel.indicatorVisible(false);
                $("#status_icon").on('click', function (e) {
                    var status = $("#status_icon").attr("name");
                    if (status == 0) status = 5;
                    else if (status == 5) status = 0;
                    console.log(status);
                    var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod"
                    var postData = {
                        userName: u,
                        methodName: "EMS.Common.UpdateEQP_Status",
                        param: status + '^' + params.CODE_EQP
                    }

                    $.ajax({
                        type: 'POST',
                        data: postData,
                        url: url,
                        cache: false,
                        success: function (data, textStatus) {
                            DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                            $("#formDevice").dxForm("instance").repaint();
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
                })
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
            param: viewModel.parentMenu()
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
                methodName: "EMS.EMS_REP."+m,
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