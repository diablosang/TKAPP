DMAPP.M_AMD = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_PQC"),
        viewShown: function () {
            this.title(params.CODE_EQP);
            try {
                BindData();
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        gridAMDOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr: "SID",
            columnAutoWidth: true,
            columns: [],
            height: function () {
                return window.innerHeight*0.82;
            },
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            },
            onRowClick: function (e) {
                if (e.rowType == "data") {
                    OpenView(e.data.SID);
                }
            }
        }
    };

    function BindData() {
        viewModel.indicatorVisible(true);
        GetAsapmentListData(["TP_EMS_B_AMITEM", "TP_EMS_B_AMCONFIG","TP_EMS_B_AMMETHOD"]);
        var grid = $("#gridAMD").dxDataGrid("instance");

        var columns = [
            { dataField: "SID", caption: SysMsg.sid, allowEditing: false, allowSorting: false },
            { dataField: "DATE_PLAN", caption: SysMsg.amd_dateplan, allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm" },
            { dataField: "CODE_AMITEM", caption: SysMsg.amd_codeitem, allowEditing: false, allowSorting: false },
            { dataField: "DESC_AMITEM", caption: SysMsg.amd_descitem, allowEditing: false, allowSorting: false },
            {
                dataField: "TYPE_AMITEM", caption: SysMsg.amd_type, allowEditing: false, allowSorting: false,
                lookup: {
                    dataSource: asListData.TP_EMS_B_AMITEM,
                    displayExpr: DESField(),
                    valueExpr: "IDLINE",
                }
            },
            {
                dataField: "CONFIG", caption: SysMsg.amd_config, allowEditing: false, allowSorting: false,
                lookup: {
                    dataSource: asListData.TP_EMS_B_AMCONFIG,
                    displayExpr: DESField(),
                    valueExpr: "IDLINE",
                }
            },
            {
                dataField: "METHOD", caption: SysMsg.amd_method, allowEditing: false, allowSorting: false,
                lookup: {
                    dataSource: asListData.TP_EMS_B_AMMETHOD,
                    displayExpr: DESField(),
                    valueExpr: "IDLINE",
                }
            },
            { dataField: "F_IMAGE", caption: SysMsg.amd_f_image, allowEditing: false, allowSorting: false },
        ];

        grid.option("columns", columns);

        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_AMD.GetList",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            cache: false,
            success: function (data, textStatus) {
                
                grid.option("dataSource", data);
                grid.repaint();
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function OpenView(SID) {
        var view = "EMS_T_AMD?NEW=0&CODE_EQP=" + params.CODE_EQP + "&SID=" + SID;
        DMAPP.app.navigate(view);
    }

    return viewModel;
};