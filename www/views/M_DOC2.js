DMAPP.M_DOC2 = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        keepCache: false,
        indicatorVisible: ko.observable(false),
        command: ko.observable(""),
        parentMenu: ko.observable("M_DOC2"),
        viewShown: function (e) {
            this.title(SysMsg.itemdoc);
            this.viewKey = e.viewInfo.key;

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
                        }
                    }
                }
                return;
            }

            try {
                GetWinbox(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        formOption: {
            colCount: 2,
            items: [
                {
                    label: { text: SysMsg.wlh },
                    dataField: "CODE_ITEM",
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_ITEM", "BMAINBLOCK");
                        }
                    },
                    dataWindow: true,
                    colSpan: 1
                },
                {
                    label: { text: SysMsg.codeop },
                    dataField: "CODE_CMMT",
                    colSpan: 1
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        gridDOCOption: {
            dateSerializationFormat: "yyyy-MM-dd",
            keyExpr: "ID_DOC",
            columnAutoWidth: true,
            columns: [
                { dataField: "CODE_ITEM", caption: SysMsg.wlh, allowEditing: false, allowSorting: false, width: "150px" },
                { dataField: "CODE_CMMT", caption: SysMsg.codeop, allowEditing: false, allowSorting: false, width: "60px" },
                { dataField: "ID_DOC", caption: "ID", allowEditing: false, allowSorting: false, width: "75px" },
                { dataField: "DESC_CMMT", caption: SysMsg.comment, allowEditing: false, allowSorting: false, width: "150px" },
                {
                    dataField: "TYPE", caption: SysMsg.amd_type, allowEditing: false, allowSorting: false, width: "75px",
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
                { dataField: "CODE_DOC", caption: SysMsg.fileName, allowEditing: false, allowSorting: false, width: "100%" }
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
        },
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'find', options: { icon: 'find', text: 'Search' } },
            ],
            onItemClick: function (e) {
                BindData(this);
            }
        },
    };

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
        //var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_B_EQPOI@GREPORT";
        var postData = {
            userName: u,
            func: "BD_B_ITEMOI",
            group: "GADMIN"
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var form = $("#formMain").dxForm("instance");
                form.option("formData", data[0].data[0]);
                form.repaint();
                viewModel.indicatorVisible(false);
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
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");

        var filterString = "CODE_ITEM='" + formData.CODE_ITEM + "'";
        if (formData.CODE_CMMT != null && formData.CODE_CMMT != "") {
            filterString = filterString + " and CODE_CMMT='" + formData.CODE_CMMT + "'";
        }


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

                GetWinbox(viewModel, params);
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