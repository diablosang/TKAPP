DMAPP.M_REP = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_REP"),
        popUserVisible: ko.observable(false),
        popArgu: ko.observable({}),
        viewShown: function () {
            this.title(params.CODE_EQP);
            try {
                GetWinbox(this, params);
                GetMenu(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        gridREPOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "ID_ROE", caption: "工单号", allowEditing: false, allowSorting: false },
                {
                    dataField: "TYPE_ROE", caption: "类型", allowEditing: false, allowSorting: false,
                    lookup: {
                        dataSource: [
                            { IDLINE: "1", DES: "维修" },
                            { IDLINE: "2", DES: "巡检" },
                            { IDLINE: "3", DES: "项修" },
                            { IDLINE: "4", DES: "大修" }
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                },
                { dataField: "RRP_ROE", caption: "报修人", allowEditing: false, allowSorting: false },
                { dataField: "TOF_ROE", caption: "报修时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "DATE_BEGP", caption: "计划开始时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "DESC_FP", caption: "故障现象", allowEditing: false, allowSorting: false },
                {
                    dataField: "STATUS", caption: "状态", allowEditing: false, allowSorting: false,
                    lookup: {
                        dataSource: [
                            { IDLINE: "NDRF", DES: "草稿" },                            
                            { IDLINE: "TDIT", DES: "待分配" },
                            { IDLINE: "TURP", DES: "待维修" },
                            { IDLINE: "TCOF", DES: "待确认" },
                            { IDLINE: "DSUP", DES: "委外" },
                            { IDLINE: "DCLS", DES: "关闭" }
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                }
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            }
        },
        tileREPOption: {
            items: [],
            direction: 'vertical',
            height: "100%",
            baseItemHeight: 192,
            baseItemWidth: 192,
            itemMargin: 10,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.DESC_CH +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.CODE_MENU + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.DEVPARAM == "REPAIR") {
                    var grid = $("#gridREP").dxDataGrid("instance");
                    var data = grid.option("dataSource");
                    if (data[0].MR_ROE == null || data[0].MR_ROE == "") {
                        viewModel.popArgu(e);
                        viewModel.popUserVisible(true);
                    }
                    else {
                        REPAIR();
                    }
                }
                else {
                    viewModel.popArgu(e);
                    viewModel.popUserVisible(true);
                }
            }
        },
        onPopCancelClick: function (e) {
            this.popUserVisible(false);
        },
        onPopOKClick: function (e) {
            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var argu = this.popArgu();
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
                    viewModel.popUserVisible(false);
                    if (argu.itemData.DEVOBJ == "EMS_T_ROE") {
                        switch (argu.itemData.DEVPARAM) {
                            case "START": START(); break;
                            case "APPLY": APPLY(); break;
                            case "REPAIR": REPAIR(); break;
                            case "CONFIRM": CONFIRM(); break;
                        }
                    }
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
        }
    };

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_T_ROE@GPADLIST";

        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                BindData(viewModel);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BindData(viewModel) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListData2";
        var filterString = "CODE_EQP='" + params.CODE_EQP + "' and STATUS NOT IN ('NDRF','DCLS')";
        var postData = {
            user: u,
            page: 0,
            filter: filterString
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                var gridData = [];
                for (var i = 0; i < data.length; i++) {
                    gridData.push(data[i]);
                }

                var grid = $("#gridREP").dxDataGrid("instance");

                grid.option({
                    dataSource: gridData
                });

                grid.repaint();
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetMenu(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData"
        var sql = "select * from EMS_B_MENU where isnull(PAR_MENU,'')='" + viewModel.parentMenu() + "' order by DSPIDX";
        var postData = {
            userName: u,
            sql: sql
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var tile = $("#tileREP").dxTileView("instance");
                var items = data;
                //if (viewModel.parentMenu() != "") {
                //    var back = { CODE_MENU: "SYS_BACK", DESC_CH: "返回上一层", DEVOBJ: "BACK", DSPIDX: 99 };
                //    items.push(back);
                //}

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

    function START() {
        var grid = $("#gridREP").dxDataGrid("instance");
        var data = grid.option("dataSource");
        if (data.length > 0) {
            DevExpress.ui.notify("已存在未关闭的维修单", "error", 1000);
            return;
        }

        var view = "ROEEdit?NEW=1&CODE_EQP=" + params.CODE_EQP+"&DEVPARAM=START";
        DMAPP.app.navigate(view);
    }

    function APPLY() {
        var grid = $("#gridREP").dxDataGrid("instance");
        var data = grid.option("dataSource");
        if (data.length > 0) {
            DevExpress.ui.notify("已存在未关闭的维修单", "error", 1000);
            return;
        }

        var view = "ROEEdit?NEW=1&CODE_EQP=" + params.CODE_EQP + "&DEVPARAM=APPLY";
        DMAPP.app.navigate(view);
    }

    function REPAIR() {
        var grid = $("#gridREP").dxDataGrid("instance");
        var data = grid.option("dataSource");
        var ID_ROE = grid.cellValue(0,"ID_ROE");
        var STATUS = grid.cellValue(0, "STATUS");
        if(ID_ROE==null || ID_ROE==""){
            return;
        }

        if (STATUS != 'TURP') {
            DevExpress.ui.notify("维修单的状态不匹配", "error", 1000);
            return;
        }

        var view = "ROEEdit?NEW=0&CODE_EQP=" + params.CODE_EQP + "&DEVPARAM=REPAIR&ID_ROE=" + ID_ROE;
        DMAPP.app.navigate(view);
    }

    function CONFIRM() {
        var grid = $("#gridREP").dxDataGrid("instance");
        var data = grid.option("dataSource");
        var ID_ROE = grid.cellValue(0, "ID_ROE");
        var STATUS = grid.cellValue(0, "STATUS");

        if (ID_ROE == null || ID_ROE == "") {
            return;
        }

        if (STATUS != 'TCOF' && STATUS != "DSUP") {
            DevExpress.ui.notify("维修单的状态不匹配", "error", 1000);
            return;
        }


        ButtonClick(viewModel, "BMAINLIST", "BTNDCLS", "", null);
        BindData(viewModel);
    }

    return viewModel;
};