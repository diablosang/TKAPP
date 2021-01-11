DMAPP.M_EMP = function (params) {
    "use strict";
    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_MAT"),
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
        gridEMPOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr:"ID_EMP",
            columnAutoWidth: true,
            columns: [
                       { dataField: "ID_EMP", caption: "单号", allowEditing: false, allowSorting: false },
                       { dataField: "DATE_PLAN", caption: "计划开始日期", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd" },
                       { dataField: "DATE_EPLAN", caption: "计划结束日期", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd" },
                       {
                           dataField: "PERIOD_EMP", caption: "周期", allowEditing: false, allowSorting: false,
                           lookup: {
                               dataSource: [
                                   { IDLINE: "03", DES: "季度" },
                                   { IDLINE: "06", DES: "半年" },
                                   { IDLINE: "12", DES: "整年" },
                               ],
                               displayExpr: "DES",
                               valueExpr: "IDLINE",
                           }
                       },
                        {
                            dataField: "STATUS", caption: "状态", allowEditing: false, allowSorting: false,
                            lookup: {
                                dataSource: [
                                    { IDLINE: "TSPT", DES: "待保养" },
                                    { IDLINE: "TCOF", DES: "生产主管确认" },
                                    { IDLINE: "TDCF", DES: "设备主管确认" },
                                    { IDLINE: "TECF", DES: "工程师确认" }
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
        tileEMPOption: {
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
                viewModel.popArgu(e);
                viewModel.popUserVisible(true);
                //if (e.itemData.DEVOBJ == "EMS_T_EMP") {
                //    switch (e.itemData.DEVPARAM) {
                //        case "PM": PM(); break;
                //        case "CONF": CONF(); break;
                //        case "ECOF": ECOF(); break;
                //    }
                //}
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
                    if (argu.itemData.DEVOBJ == "EMS_T_EMP") {
                        switch (argu.itemData.DEVPARAM) {
                            case "PM": PM(); break;
                            case "CONF": CONF(); break;
                            case "ECOF": ECOF(); break;
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
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_T_EMP@GPADLIST";

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

                var grid = $("#gridEMP").dxDataGrid("instance");

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
                var tile = $("#tileEMP").dxTileView("instance");
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

    function PM() {
        var grid = $("#gridEMP").dxDataGrid("instance");
        var data = grid.getSelectedRowsData();
        if (data.length == 0) {
            return;
        }
        var ID_EMP = data[0].ID_EMP;

        if (ID_EMP == null || ID_EMP == "") {
            return;
        }

        var STATUS = data[0].STATUS;
        if (STATUS != "TSPT") {
            DevExpress.ui.notify("维修单的状态不匹配", "error", 1000);
            return;
        }

        var view = "EMPEdit?NEW=0&CODE_EQP=" + params.CODE_EQP + "&DEVPARAM=PM&ID_EMP=" + ID_EMP;
        DMAPP.app.navigate(view);
    }

    function CONF() {
        var grid = $("#gridEMP").dxDataGrid("instance");
        var data = grid.getSelectedRowsData();
        if (data.length == 0)
        {
            return;
        }
        var ID_EMP = data[0].ID_EMP;

        if (ID_EMP == null || ID_EMP == "") {
            return;
        }

        var STATUS = data[0].STATUS;
        if (STATUS != "TCOF") {
            DevExpress.ui.notify("维修单的状态不匹配", "error", 1000);
            return;
        }
      
        var view = "EMPEdit?NEW=0&CODE_EQP=" + params.CODE_EQP + "&DEVPARAM=CONF&ID_EMP=" + ID_EMP;
        DMAPP.app.navigate(view);
    }

    function ECOF() {
        var grid = $("#gridEMP").dxDataGrid("instance");
        var data = grid.getSelectedRowsData();
        if (data.length == 0) {
            return;
        }
        var ID_EMP = data[0].ID_EMP;

        if (ID_EMP == null || ID_EMP == "") {
            return;
        }

        var STATUS = data[0].STATUS;
        if (STATUS != "TDCF" && STATUS != "TECF") {
            DevExpress.ui.notify("维修单的状态不匹配", "error", 1000);
            return;
        }

        var status = data[0].STATUS;
        var view = "EMPEdit?NEW=0&CODE_EQP=" + params.CODE_EQP + "&DEVPARAM=ECOF&ID_EMP=" + ID_EMP+"&STATUS="+status;
        DMAPP.app.navigate(view);
    }

    return viewModel;
};