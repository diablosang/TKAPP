DMAPP.M_DOC = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_DOC"),
        viewShown: function () {
            this.title(params.CODE_EQP);
            try {
                GetWinbox(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        gridDOCOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr: "ID_DOC",
            columnAutoWidth: true,
            columns: [
                       { dataField: "ID_DOC", caption: "ID", allowEditing: false, allowSorting: false,width:"75px" },
                       { dataField: "CODE_OP", caption: "工序", allowEditing: false, allowSorting: false, width: "75px" },
                       {
                           dataField: "TYPE", caption: "类型", allowEditing: false, allowSorting: false,width:"75px",
                           lookup: {
                               dataSource: [
                                   { IDLINE: "01", DES: "手册类" },
                                   { IDLINE: "02", DES: "技术类" },
                                   { IDLINE: "09", DES: "其他" }
                               ],
                               displayExpr: "DES",
                               valueExpr: "IDLINE",
                           }
                       },
                       { dataField: "CODE_DOC", caption: "文档名", allowEditing: false, allowSorting: false, width: "100%" }
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            onRowClick: function (e) {
                OpenFile(e.data.ID_DOC);
            }
        }
    };

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=V_EMS_B_DOC@GADMIN";

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
        var filterString = "CODE_EQP='" + params.CODE_EQP+"'";
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

                var grid = $("#gridDOC").dxDataGrid("instance");

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

    function OpenFile(fileID) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/DownloadFile?UserName=" + u + "&FILEID=" + fileID;
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var furl = $("#WebApiServerURL")[0].value + "/Asapment/Temp/" + data.file;
                window.open(furl);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};