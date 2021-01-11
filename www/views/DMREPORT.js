DMAPP.DMREPORT = function (params) {
    "use strict";

    var viewModel = {
        title: SysMsg.ws_4,
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_DOC"),
        viewShown: function () {
            BindData();
        },
        gridOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr: "FUNCID",
            columnAutoWidth: true,
            columns: [
                { dataField: "FUNCID", caption: SysMsg.reportCode, allowEditing: false, allowSorting: false, width: "200px" },
                {
                    dataField: (function () {
                        if (DeviceLang() == "CHS") {
                            return "DES1";
                        }
                        else {
                            return "DES2";
                        }
                    })(), caption: SysMsg.reportName, allowEditing: false, allowSorting: false, width: "300px"
                },
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            onRowClick: function (e) {
                OpenReport(e.data);
            }
        }
    };

    function BindData() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetReports",
            param: ""
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var grid = $("#gridReport").dxDataGrid("instance");
                grid.option("dataSource", data);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function OpenReport(e) {
        var view = "FormList?FUNCID=" + e.FUNCID+"@GADMIN";
        DMAPP.app.navigate(view);
    }


    return viewModel;
};