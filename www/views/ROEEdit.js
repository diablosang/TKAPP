DMAPP.ROEEdit = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [],
            direction: 'vertical',
            height: "100%",
            baseItemHeight: 192,
            baseItemWidth: 192,
            itemMargin: 10,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.text +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.text + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.name == "BTNFIN" || e.itemData.name == "BTNDSUP") {
                    viewModel.popArgu(e);
                    viewModel.popUserVisible(true);                   
                }
                else {
                    BarItemClick(e);
                }
            }
        },
        detailBarOption: {
            items: [
                { location: 'before', widget: 'button', name: "new", needComment: "0", options: { icon: "add" } }
            ],
            onItemClick: function (e) {
                if (e.itemData.name == "new") {
                    AddNewRow();
                }
            }
        },
        tabOptions: {
            dataSource: [{ text: "故障部位", tid: "1" }, { text: "领用明细", tid: "2" }, { text: "辅修人", tid: "3" }],
            selectedIndex: 0,
            onItemClick: function (e) {
                var $block1 = $("#gridFLOC")[0];
                var $block2 = $("#gridITEM")[0];
                var $block3 = $("#gridROEP")[0];
                if (e.itemData.tid == "1") {
                    $block1.style.display = "block";
                    $block2.style.display = "none";
                    $block3.style.display = "none";
                }
                else if (e.itemData.tid == "2") {
                    $block2.style.display = "block";
                    $block1.style.display = "none";
                    $block3.style.display = "none";
                }
                else {
                    $block3.style.display = "block";
                    $block1.style.display = "none";
                    $block2.style.display = "none";
                }

                //var scroll = $("#scrollView").dxScrollView("instance");
                //scroll.update();
            }
        },
        winbox: {},
        keepCache: false,
        popUserVisible: ko.observable(false),
        popArgu: ko.observable({}),
        onPopCancelClick: function (e) {
            this.popUserVisible(false);
        },
        onPopOKClick: function (e) {
            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var argu = this.popArgu();
            var popUser = $("#txtPopUser").dxTextBox("instance").option("value");
            var popPwd = $("#txtPopPwd").dxTextBox("instance").option("value");
            var popParam = popUser + ";" + popPwd + ";" + argu.itemData.name;
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
                    viewModel.popUserVisible(false);
                    BarItemClick(argu);
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
        },
        popUserShown: function (e) {
            var popUser = $("#txtPopUser").dxTextBox("instance");
            var popPwd = $("#txtPopPwd").dxTextBox("instance");
            if (keepPopUserInfo == false) {
                
                popUser.option("value", "");
                popPwd.option("value", "");
            }
            else {
                var u = sessionStorage.getItem("username");
                if (u.toUpperCase() == "ADMIN") {
                    var p = localStorage.getItem("password");
                    popUser.option("value", u);
                    popPwd.option("value", p);
                }
            }
        },
        viewShown: function (e) {
            this.viewKey = e.viewInfo.key;
            viewModel.title(params.ID_EMP);

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
                        switch (param.blockID) {
                            case "BMAINBLOCK": UpdateDataWindow(this); break;
                            case "BFLOC": UpdateGridDataWindow(this, "gridFLOC"); break;
                            case "BDETAIL": UpdateGridDataWindow(this, "gridITEM"); break;
                            case "BAMS": UpdateGridDataWindow(this, "gridROEP"); break;
                        }
                    }
                }
                return;
            }

            try {
                InitView(this,params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        viewHidden: function (e) {
            //if (viewModel.keepCache == false) {
            //    var cache = DMAPP.app.viewCache;
            //    cache.removeView(this.viewKey);
            //}
        },
        formOption: {
            colCount: 3,
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        gridFLOCOption: {
            block: "BFLOC",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "LINE_FLOC", caption: "行号", allowEditing: false, allowSorting: false, width: 50 },
                { dataField: "DESC_FLOCP1", caption: "故障部位1", allowEditing: true, allowSorting: false, width: 110, dataWindow: true },
                { dataField: "DESC_FLOCP2", caption: "故障部位2", allowEditing: true, allowSorting: false, width: 110, dataWindow: true },
                { dataField: "DESC_FLOC", caption: "故障部位3", allowEditing: true, allowSorting: false, width: 110, dataWindow: true },
                { dataField: "AN_ROE", caption: "报警号1", allowEditing: true, allowSorting: false, width: 100 },
                { dataField: "AN_ROE2", caption: "报警号2", allowEditing: true, allowSorting: false, width: 100 },
                { dataField: "AN_ROE3", caption: "报警号3", allowEditing: true, allowSorting: false, width: 100 },
                { dataField: "SERVO", caption: "伺服代码", allowEditing: true, allowSorting: false, width: 100 },
            ],
            editing: {
                allowUpdating: true,
                allowDeleting: true,
                mode: "cell"
            },
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            currentRow: 0,
            onRowClick: function (e) {
                var grid = e.component;
                var row = e.rowIndex;
                grid.editRow(row);
            },
            onCellClick: function (e) {
                SetGridRowIndex("gridFLOC", e.rowIndex);
                if (e.column.dataWindow == true) {
                    OpenGridDataWindow(this, "gridFLOC", e);
                }
            },
            onRowUpdated: function (e) {
                var idx = e.component.getRowIndexByKey(e.key);
                e.rowIndex = idx;
                GridRowUpdated(this, "gridFLOC", e)
            },
            onRowInserted: function (e) {
                GridRowInsert(this, "gridFLOC", e)
            },
            onRowRemoving: function (e) {
                GridRowDelete(this, "gridFLOC", e)
            }
        },
        gridITEMOption: {
            block: "BDETAIL",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
               { dataField: "LINE_RLOSP", caption: "行号", allowEditing: false, allowSorting: false, width: 50 },
               { dataField: "CODE_ITEM", caption: "物料代码", allowEditing: true, allowSorting: false, width: 100, dataWindow: true },
               { dataField: "DESC_ITEM", caption: "物料描述", allowEditing: false, allowSorting: false, width: 200 },
               { dataField: "SPEC_ITEM", caption: "规格", allowEditing: false, allowSorting: false, width: 100 },
               { dataField: "MODEL_ITEM", caption: "型号", allowEditing: false, allowSorting: false, width: 100 },
               { dataField: "QTY_REQ", caption: "需求数量", allowEditing: true, allowSorting: false, width: 100 },
               { dataField: "QTY_ISS", caption: "实发数量", allowEditing: false, allowSorting: false, width: 100 },              
               //{ dataField: "QTY_SP", caption: "自备数量", allowEditing: false, allowSorting: false, width: 100 },
               { dataField: "CODE_LOC", caption: "货架", allowEditing: true, allowSorting: false, width: 100 },
               //{ dataField: "F_WH", caption: "仓库申领", allowEditing: true, allowSorting: false, width: 100, dataType: "boolean" }
               //{ dataField: "REMARK", caption: "备注", allowEditing: true, allowSorting: false, width: 100 },
            ],
            editing: {
                allowDeleting: true,
                allowUpdating: true,
                mode: "cell"
            },
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            currentRow: 0,
            onRowClick: function (e) {
                var grid = e.component;
                var row = e.rowIndex;
                grid.editRow(row);
            },
            onCellClick: function (e) {
                SetGridRowIndex("gridITEM", e.rowIndex);
                if (e.column.dataWindow == true) {
                    OpenGridDataWindow(this, "gridITEM", e);
                }

            },
            onRowUpdated: function (e) {
                var idx = e.component.getRowIndexByKey(e.key);
                e.rowIndex = idx;
                GridRowUpdated(this, "gridITEM", e)
            },
            onRowInserted: function (e) {
                GridRowInsert(this, "gridITEM", e)
            },
            onRowRemoving: function (e) {
                if (GridRowDelete(this, "gridITEM", e) == false) {
                    e.cancel = true;
                }
            }
        },
        gridROEPOption: {
            block: "BAMS",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "LINE_ROEP", caption: "行号", allowEditing: false, allowSorting: false, width: 50 },
                //{ dataField: "DRL_ROEP", caption: "辅修人", allowEditing: true, allowSorting: false, width: 100, dataWindow: true },
                { dataField: "DRL_NAME", caption: "辅修人", allowEditing: true, allowSorting: false, width: 100, dataWindow: true }
            ],
            editing: {
                allowUpdating: true,
                allowDeleting: true,
                mode: "cell"
            },
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            currentRow: 0,
            onRowClick: function (e) {
                var grid = e.component;
                var row = e.rowIndex;
                grid.editRow(row);
            },
            onCellClick: function (e) {
                SetGridRowIndex("gridROEP", e.rowIndex);
                if (e.column.dataWindow == true) {
                    OpenGridDataWindow(this, "gridROEP", e);
                }

            },
            onRowUpdated: function (e) {
                var idx = e.component.getRowIndexByKey(e.key);
                e.rowIndex = idx;
                GridRowUpdated(this, "gridROEP", e)
            },
            onRowInserted: function (e) {
                GridRowInsert(this, "gridROEP", e)
            },
            onRowRemoving: function (e) {
                GridRowDelete(this, "gridROEP", e)
            }
        },
        started: false
    };

    function InitView(viewModel, params) {
        var formItems;
        var toolItems;
        var optionFP = {
            displayExpr: "DES1",
            valueExpr: "IDLINE",
            dataSource: [
                { IDLINE: "01", DES1: "尺寸超差" },
                { IDLINE: "02", DES1: "光洁度超差" },
                { IDLINE: "03", DES1: "操作面板异常" },
                { IDLINE: "04", DES1: "主轴异常" },
                { IDLINE: "05", DES1: "驱动轴X异常" },
                { IDLINE: "06", DES1: "驱动轴Y异常" },
                { IDLINE: "07", DES1: "驱动轴Z异常" },
                { IDLINE: "08", DES1: "刀仓、换刀臂异常" },
                { IDLINE: "09", DES1: "交换台异常" },
                { IDLINE: "10", DES1: "电控系统异常" },
                { IDLINE: "11", DES1: "分度台异常" },
                { IDLINE: "12", DES1: "液压站异常" },
                { IDLINE: "13", DES1: "集中润滑系统异常" },
                { IDLINE: "14", DES1: "主轴油冷却系统异常" },
                { IDLINE: "15", DES1: "排屑机异常" },
                { IDLINE: "16", DES1: "切削液系统异常" },
                { IDLINE: "17", DES1: "漏油" },
                { IDLINE: "18", DES1: "漏液" }
            ]
        };

        if (params.DEVPARAM == "START") {
            

            formItems = [
                {
                    label: { text: "故障现象1" },
                    dataField: "CODE_FP",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象2" },
                    dataField: "CODE_FP2",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象3" },
                    dataField: "CODE_FP3",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象4" },
                    dataField: "CODE_FP4",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象5" },
                    dataField: "CODE_FP5",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "备注" },
                    dataField: "REMARK_F",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 3
                }
            ]

            toolItems = [{ name: 'BTNSUBMIT', text: '提交' }];
        }
        else if (params.DEVPARAM == "APPLY") {
            formItems = [
                {
                    label: { text: "类型" },
                    editorType: "dxLookup",
                    editorOptions: {
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                        dataSource: [
                            { IDLINE: "2", DES: "巡检" },
                            { IDLINE: "3", DES: "项修" },
                            { IDLINE: "4", DES: "大修" }
                        ]
                    },
                    dataField: "TYPE_ROE",
                    colSpan: 1
                },
                {
                    label: { text: "预计时间（小时）" },
                    dataField: "PER_PLAN",
                    editorType: "dxNumberBox",
                    colSpan: 1
                },
                {
                    itemType: "empty",
                    colSpan: 1
                },
                {
                    label: { text: "故障现象1" },
                    dataField: "CODE_FP",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象2" },
                    dataField: "CODE_FP2",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象3" },
                    dataField: "CODE_FP3",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象4" },
                    dataField: "CODE_FP4",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "故障现象5" },
                    dataField: "CODE_FP5",
                    editorType: "dxLookup",
                    editorOptions: optionFP,
                    colSpan: 3
                },
                {
                    label: { text: "备注" },
                    dataField: "REMARK_F",
                    colSpan: 3
                }
            ]

            toolItems = [{ name: 'BTNSUBMIT', text: '提交' }];
        }
        else if (params.DEVPARAM == "REPAIR") {
            formItems = [
                {
                    label: { text: "主修人" },
                    dataField: "MR_ROE",
                    editorOptions: {
                        readOnly: true,
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "MR_ROE", "BMAINBLOCK");
                        }
                    },
                    dataWindow: true,
                    colSpan: 1
                },
                {
                    label: { text: "开始时间" },
                    dataField: "DATE_BEG",
                    editorType: "dxDateBox",
                    editorOptions: {
                        readOnly: true,
                        type: "datetime",
                        formatString: "yyyy-MM-dd HH:mm",
                        pickerType: "calendar",
                        dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss"
                    },
                    colSpan: 1
                },
                {
                    label: { text: "结束时间" },
                    dataField: "DATE_END",
                    editorType: "dxDateBox",
                    editorOptions: {
                        readOnly: true,
                        type: "datetime",
                        formatString: "yyyy-MM-dd HH:mm",
                        pickerType: "calendar",
                        dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss"
                    },
                    colSpan: 1
                },
                {
                    label: { text: "维修动作" },
                    dataField: "CODE_MA",
                    editorType: "dxLookup",
                    editorOptions: {
                        displayExpr: "DES1",
                        valueExpr: "IDLINE",
                        dataSource: [
                            { IDLINE: "01", DES1: "维修" },
                            { IDLINE: "02", DES1: "更换"},
                            { IDLINE: "03", DES1: "调整" }
                        ]
                    },
                    colSpan: 1
                },
                {
                    label: { text: "维修结论" },
                    dataField: "CODE_MC",
                    editorType: "dxLookup",
                    editorOptions: {
                        displayExpr: "DES1",
                        valueExpr: "IDLINE",
                        dataSource: [
                            { IDLINE: "01", DES1: "修复、恢复生产" },
                            { IDLINE: "02", DES1: "修复、待调机" },
                            { IDLINE: "03", DES1: "未修复、等待备件" },
                            { IDLINE: "04", DES1: "未修复、原因不明" }
                        ]
                    },
                    colSpan: 2
                },
                {
                    label: { text: "备注" },
                    dataField: "REMARK_M",
                    colSpan: 3
                }
            ]

            $("#divDetail")[0].style.display = "block";

            toolItems = [
                { name: 'save', text: '保存' },
                { name: 'BTNFIN', text: '完成' },
                { name: 'BTNDSUP', text: '外协' },
            ];
        }

        var form = $("#formMain").dxForm("instance");
        form.option("items", formItems);
        form.repaint();

        var tile = $("#tileBar").dxTileView("instance");
        tile.option("items", toolItems);
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        var idata = {};
        var groupid = "";
        
        if (params.DEVPARAM == "REPAIR") {
            groupid = "GTURP";
        }
        else {
            groupid = "GPADLIST"
        }

        if (params.NEW == "1") {
            var typeRoe = "1";
            if (params.DEVPARAM == "APPLY") {
                typeRoe = "2";
            }

            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_T_ROE",
                group: "GNDRF",
                initdata: {
                    CODE_EQP: params.CODE_EQP,
                    TYPE_ROE:typeRoe
                }
            }
        }
        else {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetWinboxDataSimple"
            var postData = {
                userName: u,
                func: "EMS_T_ROE",
                group: groupid,
                doc: params.ID_ROE
            };
        }


        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                var form = $("#formMain").dxForm("instance");
                var gridFLOC = $("#gridFLOC").dxDataGrid("instance");
                var gridITEM = $("#gridITEM").dxDataGrid("instance");
                var gridROEP = $("#gridROEP").dxDataGrid("instance");

                for (var i = 0; i < data.length; i++) {
                    if (data[i].IDNUM == "BMAINBLOCK") {
                        form.option("formData", data[i].data[0]);
                        form.repaint();
                    }

                    if (data[i].IDNUM == "BFLOC") {
                        gridFLOC.option("dataSource", data[i].data);
                        gridFLOC.refresh();
                    }

                    if (data[i].IDNUM == "BDETAIL") {
                        gridITEM.option("dataSource", data[i].data);
                        gridITEM.refresh();
                    }

                    if (data[i].IDNUM == "BAMS") {
                        gridROEP.option("dataSource", data[i].data);
                        gridROEP.refresh();
                    }
                }

                viewModel.keepCache = true;
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

    function BarItemClick(e) {
        if (e.itemData.needComment == "1") {
            this.commentVisible(true);
            this.comment(e.itemData.options.text);
            this.commentButton(e.itemData.name);
        }
        else {
            if (e.itemData.EXTPROP != null) {
                if (e.itemData.EXTPROP.RUNAT == "DEVICE") {
                    ButtonClickDevice(e.itemData);
                    return;
                }
            }


            ValidChange();
            setTimeout(function () {
                if (e.itemData.name == "BTNFIN") {
                    var form = $("#formMain").dxForm("instance");
                    var formData = form.option("formData");
                    if (formData.CODE_MA == null || formData.CODE_MC == null || formData.CODE_MA == "" || formData.CODE_MC == "") {
                        DevExpress.ui.notify("必须填写维修动作和维修结论", "error", 2000);
                        return;
                    }

                    ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
                    //var closeDialog = DevExpress.ui.dialog.custom({
                    //    title: SysMsg.info,
                    //    message: "您是否确认维修完成？",
                    //    buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
                    //});

                    //closeDialog.show().done(function (dialogResult) {
                    //    if (dialogResult == true) {
                    //        ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
                    //    }
                    //    else {
                    //        return;
                    //    }
                    //});
                }
                else {
                    ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
                }
                
            }, 200);
            
        }
    }

    function AddNewRow() {
        viewModel.indicatorVisible(true);

        var tab = $("#tabDetail").dxTabs("instance");
        var index = tab.option("selectedIndex");
        var grid;
        if (index == "0") {
            grid = $("#gridFLOC").dxDataGrid("instance");
        }
        else if (index == "1") {
            grid = $("#gridITEM").dxDataGrid("instance");
        }
        else {
            grid = $("#gridROEP").dxDataGrid("instance");
        }

        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/AddNewRow";
        var postData = {
            blockID: grid.option("block"),
            userName: u
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                var ds = grid.option("dataSource");
                ds.push(data[0]);
                grid.option("dataSource", ds);
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function ValidChange() {
        var gridFLOC = $("#gridFLOC").dxDataGrid("instance");
        var gridITEM = $("#gridITEM").dxDataGrid("instance");
        var gridROEP = $("#gridROEP").dxDataGrid("instance");
        gridFLOC.closeEditCell();
        gridITEM.closeEditCell();
        gridROEP.closeEditCell();
    }

    return viewModel;
};