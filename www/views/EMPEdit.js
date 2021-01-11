DMAPP.EMPEdit = function (params) {
    "use strict";

    var viewModel = {
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
                BarItemClick(e);
            }
        },
        winbox: {},
        group:ko.observable(""),
        keepCache: false,
        viewShown: function (e) {
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
                            case "BEMPROJ": UpdateGridDataWindow(this, "gridDetail"); break;
                            case "BITEM": UpdateGridDataWindow(this, "gridITEM"); break;
                        }
                    }
                }
                return;
            }

            try {
                InitView(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        viewHidden: function (e) {
            //if (viewModel.keepCache == false) {
            //    var cache = DMAPP.app.viewCache;
            //    cache.removeView(e.viewInfo.key);
            //}
        },
        formOption: {
            colCount: 3,
            items: [
                {
                    label: { text: "保养开始日期" },
                    dataField: "DATE_PLAN",
                    editorType: "dxDateBox",
                    editorOptions: {
                        formatString:"yyyy-MM-dd",
                        pickerType:"calendar",
                        dateSerializationFormat: "yyyy-MM-dd"
                    },
                    colSpan: 1
                },
                {
                    label: { text: "保养结束日期" },
                    dataField: "DATE_EPLAN",
                    editorType: "dxDateBox",
                    editorOptions: {
                        formatString: "yyyy-MM-dd",
                        pickerType: "calendar",
                        dateSerializationFormat: "yyyy-MM-dd"
                    },
                    colSpan: 1
                },
                {
                    label: { text: "执行人" },
                    dataField: "EMP_PER",
                    editorOptions: {
                        onFocusIn:function(e){
                            OpenDataWindow(this,"EMP_PER","BMAINBLOCK");
                        }
                    },
                    colSpan: 1
                },
                 {
                     label: { text: "结论" },
                     dataField: "EMP_CON",
                     dataWindow: true,
                     colSpan: 3
                 },
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true)
                {
                    MainValueChanged(viewModel,e);
                }
            }
        },
        gridDetailOption: {
            block:"BEMPROJ",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "LINE_PROJ", caption: "序号", allowEditing: false, allowSorting: false, width: 50 },
                { dataField: "PART_PML", caption: "部位", allowEditing: false, allowSorting: false, width: 100 },
                { dataField: "PROJ_PML", caption: "项目", allowEditing: false, allowSorting: false, width: 300 },
                { dataField: "TIME_PML", caption: "时间", allowEditing: false, allowSorting: false, width: 60 },
                { dataField: "CON_PML", caption: "方法", allowEditing: false, allowSorting: false, width: 60 },
                { dataField: "EMP_SOL", caption: "异常原因解决方案", allowEditing: true, allowSorting: false, },
                 { dataField: "EMP_PER", caption: "执行人", allowEditing: true, allowSorting: false, width: 100, dataWindow:true},
            ],
            editing: {
                allowUpdating: true,
                mode:"cell"
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
                SetGridRowIndex("gridDetail",e.rowIndex);
                if (e.column.dataWindow == true)
                {
                    OpenGridDataWindow(this, "gridDetail", e);
                }

            },
            onRowUpdated: function (e) {
                var idx = e.component.getRowIndexByKey(e.key);
                e.rowIndex = idx;
                GridRowUpdated(this, "gridDetail", e)
            }
        },
        gridITEMOption: {
            block: "BITEM",
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
        tabOptions: {
            dataSource: [{ text: "保养项目", tid: "1" }, { text: "领用明细", tid: "2" }],
            selectedIndex: 0,
            onItemClick: function (e) {
                var $block1 = $("#gridDetail")[0];
                var $block2 = $("#gridITEM")[0];
                var detailBar = $("#detailBar");
                if (e.itemData.tid == "1") {
                    $block1.style.display = "block";
                    $block2.style.display = "none";
                    detailBar.hide();
                }
                else if (e.itemData.tid == "2") {
                    $block2.style.display = "block";
                    $block1.style.display = "none";
                    detailBar.show();
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
        }
    };

    function InitView(viewModel, params) {
        var toolItems;
        var form = $("#formMain").dxForm("instance");
        var gridDetail = $("#gridDetail").dxDataGrid("instance");
        var gridITEM = $("#gridITEM").dxDataGrid("instance");
        var detailBar = $("#detailBar").dxToolbar("instance");
        $("#detailBar").hide();

        if (params.DEVPARAM == "PM") {
            gridITEM.option("disabled", false);
            detailBar.option("disabled", false);
            toolItems = [
                //{ location: 'before', widget: 'button', name: 'save', options: { text: '保存' } },
                //{ location: 'before', widget: 'button', name: 'A386', options: { text: '提交' } }];
                { name: 'save', text: '保存' },
                { name: 'A386', text: '提交' }
                ];
        }
        else if (params.DEVPARAM == "CONF") {
            //toolItems = [{ location: 'before', widget: 'button', name: 'A462', options: { text: '确认' } }];
            toolItems = [
                { name: 'A462', text: '确认' },
                { name: 'A452', text: '退回' }];
            gridDetail.columnOption("EMP_SOL", "allowEditing", false);
            gridDetail.columnOption("EMP_PER", "allowEditing", false);
            form.option("readOnly", true);
            gridITEM.option("disabled", true);
            detailBar.option("disabled", true);
        }
        else if (params.DEVPARAM == "ECOF") {
            var btn = "";
            if (params.STATUS == "TDCF") {
                btn = "A465";
            }
            else {
                btn = "A466";
            }

            toolItems = [
                { name: btn, text: '确认' }
                //{ location: 'before', widget: 'button', name: btn, options: { } }
            ];
            gridDetail.columnOption("EMP_SOL", "allowEditing", false);
            gridDetail.columnOption("EMP_PER", "allowEditing", false);
            form.option("readOnly", true);
            gridITEM.option("disabled", true);
            detailBar.option("disabled", true);
        }

        //var toolbar = $("#mainBar").dxToolbar("instance");
        //toolbar.option("items", toolItems);
        var tile = $("#tileBar").dxTileView("instance");
        tile.option("items", toolItems);
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetWinboxDataSimple"
        var groupname = "";
        if (params.DEVPARAM == "PM") {
            groupname = "GDAPR";
        }
        else if (params.DEVPARAM == "CONF") {
            groupname = "GTCOF";
        }
        else if (params.DEVPARAM == "ECOF") {
            if (params.STATUS == "TDCF") {
                groupname = "GTDCF";
            }
            else {
                groupname = "GTECF";
            }
        }

        var postData = {
            userName: u,
            func: "EMS_T_EMP",
            group: groupname,
            doc:params.ID_EMP
        }

        $.ajax({
            type: 'POST',
            data:postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                var form = $("#formMain").dxForm("instance");
                var gridDetail = $("#gridDetail").dxDataGrid("instance");
                var gridITEM = $("#gridITEM").dxDataGrid("instance");

                for (var i = 0; i < data.length; i++){
                    if (data[i].IDNUM == "BMAINBLOCK") {
                        form.option("formData", data[i].data[0]);
                        form.repaint();
                    }

                    if (data[i].IDNUM == "BEMPROJ") {
                        gridDetail.option("dataSource", data[i].data);
                        gridDetail.refresh();
                    }

                    if (data[i].IDNUM == "BITEM") {
                        gridITEM.option("dataSource", data[i].data);
                        gridITEM.refresh();
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
        var gridDetail = $("#gridDetail").dxDataGrid("instance");
        gridDetail.saveEditData();

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
                ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
            }, 200);
        }
    }

    function ValidChange() {
        var gridDetail = $("#gridDetail").dxDataGrid("instance");
        var gridITEM = $("#gridITEM").dxDataGrid("instance");
        gridDetail.closeEditCell();
        gridITEM.closeEditCell();
    }

    function AddNewRow() {
        viewModel.indicatorVisible(true);

        var tab = $("#tabDetail").dxTabs("instance");
        var index = tab.option("selectedIndex");
        var grid;
        if (index == "1") {
            grid = $("#gridITEM").dxDataGrid("instance");
        }
        else {
            return;
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

    return viewModel;
};