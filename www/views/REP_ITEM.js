DMAPP.REP_ITEM = function (params) {
    "use strict";
    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable(""),
        popUserVisible: ko.observable(false),
        popArgu: ko.observable({}),
        instance: {},
        OLD_CODE_ITEM:null,
        viewShown: function (e) {
            this.title(params.CODE_EQP);
            SetLanguage();
            this.viewKey = e.viewInfo.key;
            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                var viewAction = sessionStorage.getItem("viewAction");
                if (viewAction != null) {
                    sessionStorage.removeItem("viewAction");
                    if (viewAction == "refreshRow") {
                        RefreshData(this);
                    }

                    if (viewAction == "dataWindow") {
                        var param = JSON.parse(sessionStorage.getItem("dwParam"));
                        if (param.blockID == "BMAINBLOCK") {
                            UpdateDataWindow(this);
                        }
                        else {
                            UpdateGridDataWindow(this, "gridDetail");
                        }
                    }
                    $("#formMain").dxForm("instance").repaint();
                }
                return;
            }
            try {
                GetWinbox(this, params);
                GetList();
            }
            catch (e) {
                DevExpress.ui.notify(SysMsg.noDetail, "error", 1000);
            }
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        tabOptions: {
            dataSource: [{ text: "明细", tid: "1" }, { text: "待处理", tid: "2" }],
            selectedIndex: 0,
            onItemClick: function (e) {
                var $block1 = $("#gridNDRF")[0];
                var $block2 = $("#gridTAPR")[0];
                if (e.itemData.tid == "1") {
                    $block1.style.display = "block";
                    $block2.style.display = "none";
                }
                else if (e.itemData.tid == "2") {
                    $block2.style.display = "block";
                    $block1.style.display = "none";
                }
            }
        },
        gridNDRFOption: {
            block: "GridNDRF",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "SID", caption: "SID", allowEditing: false, allowSorting: false, width: 50 },
                { dataField: "DATE_APL", caption: SysMsg.date, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "USER_APL", caption: SysMsg.note_creusr, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "CODE_ITEM", caption: SysMsg.wlh, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "DESC_ITEM", caption: SysMsg.name, allowEditing: false, allowSorting: false, width: 100 },
                { dataField: "QTY_APL", caption: SysMsg.qty, allowEditing: false, allowSorting: false, width: 100 },
                {
                    dataField: "STATUS", caption: SysMsg.status, allowEditing: false, allowSorting: false, width: 100, lookup: {
                        dataSource: [
                            { IDLINE: "NDRF", DES: SysMsg.NDRF },
                            { IDLINE: "TAPR", DES: SysMsg.TAPR },
                            { IDLINE: "TREL", DES: SysMsg.TREL },
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                },
            ],
            selection: {
                mode: "single"
            },
        },
        gridTAPROption: {
            block: "GridTAPR",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "SID", caption: "SID", allowEditing: false, allowSorting: false, width: 50 },
                { dataField: "DATE_APL", caption: SysMsg.date, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "USER_APL", caption: SysMsg.note_creusr, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "CODE_ITEM", caption: SysMsg.wlh, allowEditing: false, allowSorting: false, width: 110 },
                { dataField: "DESC_ITEM", caption: SysMsg.name, allowEditing: false, allowSorting: false, width: 100 },
                { dataField: "QTY_APL", caption: SysMsg.qty, allowEditing: false, allowSorting: false, width: 100 },
                {
                    dataField: "STATUS", caption: SysMsg.status, allowEditing: false, allowSorting: false, width: 100, lookup: {
                        dataSource: [
                            { IDLINE: "NDRF", DES: SysMsg.NDRF },
                            { IDLINE: "TAPR", DES: SysMsg.TAPR },
                            { IDLINE: "TREL", DES: SysMsg.TREL },
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    } },
            ],
            selection: {
                mode: "single"
            },
        },
        formOption: {
            onInitialized: function (e) {
                this.instance = e.component;
            },
            colCount: 2,
            itemType: "group",
            onContentReady: function (e) {

            },
            items: [
                {
                    itemType: "group",
                    colCount: 2,
                    items: [
                        {
                            id: "CODE_ITEM",
                            label: { text: SysMsg.wlh },
                            dataField: "CODE_ITEM",
                            colSpan: 2,
                            dataWindow: true,
                            editorOptions: {
                                onFocusIn: function (e) {
                                    OpenDataWindow(this, "CODE_ITEM", "BMAINBLOCK");
                                }
                            }
                        },
                        {
                            id: "DESC_ITEM",
                            label: { text: SysMsg.name },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "DESC_ITEM",
                            colSpan: 2,
                        },
                        {
                            id: "SPEC_ITEM",
                            label: { text: SysMsg.spec },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "SPEC_ITEM",
                            colSpan: 2,
                        },
                        {
                            id: "MODEL_ITEM",
                            label: { text: SysMsg.model },
                            editorOptions: {
                                readOnly: true
                            },
                            dataField: "MODEL_ITEM",
                            colSpan: 2,
                        },
                        {
                            id: "QTY_APL",
                            label: { text: SysMsg.qty },
                            dataField: "QTY_APL",
                            colSpan: 2,
                        },
                        {
                            id: "USAGE",
                            label: { text: SysMsg.usage },
                            dataField: "USAGE",
                            editorType: "dxLookup",
                            editorOptions: {
                                dataSource: (function () {
                                    if (DeviceLang() == "CHS") {
                                        return [
                                            { IDLINE: '01', DES: "生产" },
                                            { IDLINE: '02', DES: "维修" }
                                        ];
                                    }
                                    else {
                                        return [
                                            { IDLINE: '01', DES: "Production" },
                                            { IDLINE: '02', DES: "Repair" }
                                        ];
                                    }
                                })(),
                                displayExpr: "DES",
                                valueExpr: "IDLINE"
                            },
                            colSpan: 2,
                        },
                        {
                            id: "REMARK",
                            label: { text: SysMsg.remark },
                            dataField: "REMARK",
                            colSpan: 2,
                        },
                        
                    ]
                },
                {
                    itemType: "group",
                    template: function (data, itemElement) {
                        if (data.formData.IMAGE)
                            itemElement.append("<img src='data:image;base64," + data.formData.IMAGE + "' style='max-height:220px;max-width:250px;' />");
                    },
                    colSpan: 1,
                },
                
            ],
            //onFieldDataChanged: function(e){
            //    if (e.dataField === "CODE_ITEM") {
            //        var op = e.component.getEditor("CODE_ITEM");//.option('value');
            //        if (op && op.option('value') != this.OLD_CODE_ITEM) {
            //            getCodeItem(op.option('value'));
            //        }
            //    }
            //}
        },
        tileViewOption: {
            items: [{ name: 'SUBMIT', text: SysMsg.submit }, { name: 'SYS_BACK', text: SysMsg.goback }, { name: 'Add', text: SysMsg.addNew }, { name: 'Delete', text: SysMsg.del }],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 3,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.text +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.text + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.name == "SUBMIT") {
                    //$("#gridNDRF").dxDataGrid("instance").selectAll();
                    //var row = GetSelectedRow();
                    //if (row.STATUS == 'NDRF') {
                    //    Submit();
                    //}
                    Submit();
                }
                else if (e.itemData.name == "SYS_BACK") {
                    var view = "Maintance/1.36.0?NEW=1&DEVPARAM=" + e.itemData.DEVPARAM + "&CODE_EQP=" + params.CODE_EQP + "&CODE_OP=" + params.CODE_OP;
                    //var form = $("#formDevice").dxForm("instance");
                    //var formData = form.option("formData");
                    //view = view + "&CODE_OP=" + formData.CODE_OP;
                    //viewModel.popUserVisible(false);
                    DMAPP.app.navigate(view);
                }
                else if (e.itemData.name == "Add") {
                    Add(e);
                }
                else if (e.itemData.name == "Delete") {
                    var row = GetSelectedRow();
                    if (row.STATUS == 'NDRF') {
                        Cancel(row.SID);
                    }
                }
                else {
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
                    var form = $("#formMain").dxForm("instance");
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

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_T_SPITEM",
                group: "GNDRF",
                initdata: {
                    CODE_EQP: params.CODE_EQP
                }
            }
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                //viewModel.winbox = data;
                viewModel.keepCache = true;
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify(SysMsg.nodata, "error", 1000);
                }
            }
        });
    }
    
    function GetSelectedRow() {
        var tab = $("#tabDetail").dxTabs("instance");
        var index = tab.option("selectedIndex");
        var row = null;
        if (index == "0") {
            row = $("#gridNDRF").dxDataGrid("instance").getSelectedRowsData();
        } else {
            row = $("#gridTAPR").dxDataGrid("instance").getSelectedRowsData();
        }
        if (row) {
            return row[0];
        } else {
            DevExpress.ui.notify("请选择一条数据", "error", 1000);
        }
    }
    function Submit() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_SPITEM.UpdateStatus",
            param: params.CODE_EQP
        }
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                GetList()
                viewModel.indicatorVisible(false);
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    function Cancel(sid) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_SPITEM.Cancel",
            param: sid
        }
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                GetList()
                viewModel.indicatorVisible(false);
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    function getCodeItem(code) {
        viewModel.indicatorVisible(true);
        viewModel.OLD_CODE_ITEM = code;
        if (code == '') {
            return;
        }
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_SPITEM.GetCodeItem",
            param: code
        }
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.length > 0) {
                    var form = $("#formMain").dxForm("instance");
                    form.option("formData",{ CODE_ITEM: data[0].CODE_ITEM, DESC_ITEM: data[0].DESC_ITEM, SPEC_ITEM: data[0].SPEC_ITEM, MODEL_ITEM: data[0].MODEL_ITEM, IMAGE: data[0].IMAGE });
                    form.repaint();
                }
                else {
                    ServerError(SysMsg.nodata);
                }
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    function SetLanguage() {
        var form = $("#formMain").dxForm("instance");
        if (DeviceLang() == "ENG") {
            form.itemOption("CODE_EQP", "label", { text: "Equipment Code" });
            form.itemOption("STATUS_OP", "label", { text: "Status" });
            form.itemOption("POSITION", "label", { text: "Position" });
        }

        var grid = $("#gridDevice").dxDataGrid("instance");
        if (grid && DeviceLang() == "ENG") {
            grid.columnOption("ID_WO", "caption", "Work Order No");
            grid.columnOption("TYPE_OP", "caption", "OP Type");
            grid.columnOption("CODE_ITEM", "caption", "Item Code");
            grid.columnOption("DESC_ITEM", "caption", "Item Description");
            grid.columnOption("QTY_ORD", "caption", "Planed Quantity");
            grid.columnOption("DATE_START", "caption", "Plan Date");
        }

    }

    function GetList() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_SPITEM.GetList",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data) {
                    var gridNDRF = $("#gridNDRF").dxDataGrid("instance");
                    var gridTAPR = $("#gridTAPR").dxDataGrid("instance");
                    var list1 = data.filter(function (x) {
                        return x.STATUS == 'NDRF';
                    })
                    var list2 = data.filter(function (x) {
                        return x.STATUS == 'TAPR' || x.STATUS =='TREL';
                    })
                    gridNDRF.option("dataSource", list1);
                    gridNDRF.refresh();
                    gridTAPR.option("dataSource", list2);
                    gridTAPR.refresh();
                }
                else {
                    DevExpress.ui.notify(data.ErrorMsg, "error", 1000);
                }
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function Add() {
        var u = sessionStorage.getItem("username");
        var obj = $("#formMain").dxForm("instance").option("formData");
        if (!obj.REMARK) obj.REMARK = "";
        if (!(obj.QTY_APL || obj.USAGE)) {
            DevExpress.ui.notify(SysMsg.note_reqired, "error", 1000);
            return;
        }
        var items = [];
        obj.CODE_EQP = params.CODE_EQP;
        items.push(obj)
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_SPITEM.AddNew",
            param: "",
            data: items
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                $("#formMain").dxForm("instance").resetValues();
                GetList();
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    
    return viewModel;
};