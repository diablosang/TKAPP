DMAPP.TOAPReplace = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'REP', text: '更换' }],
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
        group: ko.observable(""),
        keepCache: false,
        viewShown: function (e) {
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
            var cache = DMAPP.app.viewCache;
            cache.removeView(e.viewInfo.key);
        },
        gridDetailOption: {
            block: "BTOOL",
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "CODE_SEQ", caption: "序列号", allowEditing: false, allowSorting: false, width: 100 },
                { dataField: "CODE_ITEM", caption: "物料代码", allowEditing: false, allowSorting: false, width: 100 },
                { dataField: "DESC_ITEM", caption: "物料描述", allowEditing: false, allowSorting: false, width: 200 },
                { dataField: "SPEC_ITEM", caption: "规格", allowEditing: false, allowSorting: false, width: 300 },
                { dataField: "MODEL_ITEM", caption: "型号", allowEditing: false, allowSorting: false, width: 60 },
                { dataField: "QTY_UM", caption: "数量", allowEditing: false, allowSorting: false, width: 60 },
                { dataField: "DATE_START", caption: "运营日期", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd" }
            ],
            editing: {
                allowUpdating: true,
                mode: "cell"
            },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always"
            },
            paging: {
                enabled: false
            }
        }
    };

    function InitView(viewModel, params) {
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData"
        
        var postData = {
            userName: u,
            sql:"SELECT * FROM EMS_T_TOOL WHERE CODE_LOC = '"+params.CODE_EQP+"' AND STATUS='1'"
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var gridDetail = $("#gridDetail").dxDataGrid("instance");
                gridDetail.option("dataSource", data);
                gridDetail.refresh();
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
        if (e.itemData.name == "REP"){
            REPLACE();
        }
    }

    function REPLACE() {
        var u = sessionStorage.getItem("username");
        var grid = $("#gridDetail").dxDataGrid("instance");
        var data = grid.getSelectedRowsData();
        if (data.length == 0) {
            return;
        }
       
        var sids = "";
        for (var i = 0; i < data.length; i++) {
            sids = sids+"'" + data[i].SID + "',";
        }

        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_TOAP.Replace",
            param: sids
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
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

    return viewModel;
};