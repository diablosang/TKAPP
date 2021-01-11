DMAPP.ROEList = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(),
        indicatorVisible: ko.observable(false),
        curPage: ko.observable(1),
        viewShown: function (e) {
            this.title("设备维修" + params.CODE_EQP);
            GetListWinbox(viewModel, params);
        },
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'new', options: { text: '新建' } },
                  { location: 'before', widget: 'button', name: 'submit', options: { text: '确认' } }
            ],
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "new":{
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
                { dataField: "ID_ROE", caption: "工单号", allowEditing: false, allowSorting: false },
                {
                    dataField: "TYPE_ROE", caption: "类型", allowEditing: false, allowSorting: false,
                    lookup: {
                        dataSource: [
                            { IDLINE: "1", DES: "维修" },
                            { IDLINE: "2", DES: "检修" },
                            { IDLINE: "3", DES: "项修" },
                            { IDLINE: "3", DES: "大修" }
                        ],
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                    }
                },
                { dataField: "RRP_ROE", caption: "保修人", allowEditing: false, allowSorting: false },
                { dataField: "TOF_ROE", caption: "报修时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "DATE_BEGP", caption: "计划开始时间", allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
                { dataField: "DESC_FP", caption: "故障现象", allowEditing: false, allowSorting: false }
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

                var view = "ROEEdit?ID_ROE=" + selectedData.ID_ROE + "&CODE_EQP="+params.CODE_EQP;
                DMAPP.app.navigate(view);
            }
        }
        
    };

    function GetListWinbox(viewModel, params) {
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
        if (data.length > 0)
        {
            DevExpress.ui.notify("已存在未关闭的维修单", "error", 1000);
            return;
        }

        var view = "ROEEdit?NEW=1&CODE_EQP=" + params.CODE_EQP;
        DMAPP.app.navigate(view);
    }


    function Submit(){
        var grid = $("#gridMain").dxDataGrid("instance");
        var data = grid.option("dataSource");
        if (data.length == 0) {
            DevExpress.ui.notify("不存在需确认的维修单", "error", 1000);
            return;
        }


        var STATUS = data[0].STATUS;
        if (STATUS != "TCOF" && STATUS != "DSUP")
        {
            DevExpress.ui.notify("维修单状态不能确认", "error", 1000);
            return;
        }
        var ID_ROE = data[0].ID_ROE;
        var u = sessionStorage.getItem("username");
        var postData = {
            userName: u,
            command: "ROE.CONFIRM",
            id: ID_ROE,
            eqp:params.CODE_EQP
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