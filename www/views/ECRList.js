DMAPP.ECRList = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(),
        indicatorVisible: ko.observable(false),
        curPage: ko.observable(1),
        viewShown: function (e) {
            this.title("设备换型" + params.CODE_EQP);
            GetListWinbox(viewModel, params);
        },
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'new', options: { text: '新建' } },
                  { location: 'before', widget: 'button', name: 'submit', options: { text: '结束' } }
            ],
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "new": {
                        New();
                        break;
                    }
                    case "submit": {
                        Submit();
                        break;
                    }
                }
            }
        },
        gridOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            columnAutoWidth: true,
            columns: [
                { dataField: "ID_ECR", caption: "ID", allowEditing: false, allowSorting: false },
                { dataField: "CREUSR", caption: "申请人", allowEditing: false, allowSorting: false },
                {
                    dataField: "STATUS", caption: "状态", allowEditing: false, allowSorting: false,
                    lookup: {
                        dataSource: [
                            { IDLINE: "NDRF", DES: "草稿" },
                            { IDLINE: "TCOF", DES: "待确认" },
                            { IDLINE: "DCLS", DES: "已关闭" }
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                },
                { dataField: "TIME_START", caption: "开始时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "TIME_END", caption: "结束时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "VERSION", caption: "版本", allowEditing: false, allowSorting: false }
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            onRowClick: function (e) {
                var selectedData = e.data;
                if (selectedData == null) {
                    return;
                }

                var view = "ECREdit?ID_ECR=" + selectedData.ID_ECR + "&CODE_EQP=" + params.CODE_EQP;
                DMAPP.app.navigate(view);
            }
        }
    };

    function GetListWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_T_ECR@GPADLIST";

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
        var filterString = "CODE_EQP='" + params.CODE_EQP + "' and STATUS<>'DCLS'";
        var postData = {
            user: u,
            page: viewModel.curPage() - 1,
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

                var grid = $("#gridMain").dxDataGrid("instance");

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

    function New() {
        var grid = $("#gridMain").dxDataGrid("instance");
        var data = grid.option("dataSource");
        if (data.length > 0) {
            DevExpress.ui.notify("已存在未关闭的换型", "error", 1000);
            return;
        }

        var view = "ECREdit?NEW=1&CODE_EQP=" + params.CODE_EQP;
        DMAPP.app.navigate(view);
    }


    function Submit() {
        var grid = $("#gridMain").dxDataGrid("instance");
        var data = grid.option("dataSource");
        if (data.length == 0) {
            DevExpress.ui.notify("不存在需确认的维修单", "error", 1000);
            return;
        }

        var ID_ECR = data[0].ID_ECR;
        var u = sessionStorage.getItem("username");
        var postData = {
            userName: u,
            command: "ECR.CONFIRM",
            id: ID_ECR
        };

        var url = $("#WebApiServerURL")[0].value + "/Api/IRCZ/Command";
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                DevExpress.ui.notify("确认完成", "success", 1000);
                BindData(viewModel);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify("错误", "error", 1000);
                }
            }
        });

    }

    return viewModel;
};