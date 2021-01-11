DMAPP.M_TOL = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_TOL"),
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
        gridTOLOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr: "SID",
            columnAutoWidth: true,
            columns: [
                       { dataField: "SID", caption: "单号", allowEditing: false, allowSorting: false },
                       { dataField: "CODE_ITEM", caption: "物料号", allowEditing: false, allowSorting: false },
                       { dataField: "DESC_ITEM", caption: "物料描述", allowEditing: false, allowSorting: false },
                       { dataField: "SPEC_ITEM", caption: "规格", allowEditing: false, allowSorting: false },
                       { dataField: "MODEL_ITEM", caption: "型号", allowEditing: false, allowSorting: false },
                       { dataField: "USER_APPLY", caption: "申领人", allowEditing: false, allowSorting: false },
                       { dataField: "DATE_APPLY", caption: "申请日期", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd" },
                       { dataField: "QTY_APPLY", caption: "申领数量", allowEditing: false, allowSorting: false },
                       {
                           dataField: "TYPE", caption: "类型", allowEditing: false, allowSorting: false,
                           lookup: {
                               dataSource: [
                                   { IDLINE: "NEW", DES: "新建" },
                                   { IDLINE: "REPLACE", DES: "更换" }
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
            },
            onSelectionChanged: function (e) {

            }
        },
        tileTOLOption: {
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
                //if (e.itemData.DEVOBJ == "EMS_T_TOAP") {
                //    switch (e.itemData.DEVPARAM) {
                //        case "NEW": NEW(); break;
                //        case "REPLACE": REPLACE(); break;
                //        case "CLOSE": CLOSE(); break;
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
                    if (argu.itemData.DEVOBJ == "EMS_T_TOAP") {
                        switch (argu.itemData.DEVPARAM) {
                            case "NEW": NEW(); break;
                            case "REPLACE": REPLACE(); break;
                            case "CLOSE": CLOSE(); break;
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
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_T_TOAP@GDREL";

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
        var filterString = "CODE_EQP='" + params.CODE_EQP + "' and STATUS='DREL'";
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

                var grid = $("#gridTOL").dxDataGrid("instance");

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
                var tile = $("#tileTOL").dxTileView("instance");
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

    function NEW() {
        var view = "EMS_T_TOAP?NEW=0&CODE_EQP=" + params.CODE_EQP;
        DMAPP.app.navigate(view);
    }

    function REPLACE() {
        var view = "TOAPReplace?NEW=0&CODE_EQP=" + params.CODE_EQP;
        DMAPP.app.navigate(view);
    }

    function CLOSE() {
        var closeDialog = DevExpress.ui.dialog.custom({
            title: SysMsg.info,
            message: "您确定要取消吗？",
            buttons: [{ text: SysMsg.yes, value: true, onClick: function () { return true; } }, { text: SysMsg.no, value: false, onClick: function () { return false; } }]
        });

        closeDialog.show().done(function (dialogResult) {
            if (dialogResult == true) {
                var u = sessionStorage.getItem("username");
                var grid = $("#gridTOL").dxDataGrid("instance");
                var data = grid.getSelectedRowsData();
                if (data.length == 0) {
                    return;
                }
                var SID = data[0].SID;

                if (SID == null || SID == "") {
                    return;
                }

                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.EMS_T_TOAP.Close",
                    param: SID
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    async: false,
                    cache: false,
                    success: function (data, textStatus) {
                        BindData(viewModel);
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
        });
    }

    return viewModel;
};