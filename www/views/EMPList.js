DMAPP.EMPList = function (params) {
    "use strict";

    var viewModel = {
        indicatorVisible: ko.observable(false),
        curPage: ko.observable(1),
        viewShown: function (e) {
            GetListWinbox(viewModel, params);
        },
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'first', options: { icon: 'home', text: '' } },
                  { location: 'before', widget: 'button', name: 'prev', options: { icon: 'spinleft', text: '' } },
                  { location: 'before', widget: 'button', name: 'next', options: { icon: 'spinright', text: '' } }
            ],
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "new":
                        {
                            var view = "FormEdit?FUNCID=" + this.funcID() + "&GROUPID=" + this.groupID() + "&NEW=1";
                            Mobile.app.navigate(view);
                            break;
                        }
                    case "first": this.curPage(1); BindData(this); break;
                    case "prev":
                        {
                            if (this.curPage() == 1) {
                                return;
                            }
                            else {
                                var p = this.curPage() - 1;
                                this.curPage(p);
                                BindData(this);
                            }
                            break;

                        }
                    case "next": {
                        var p = this.curPage() + 1;
                        this.curPage(p);
                        BindData(this);
                        break;
                    }
                }
            }
        },
        gridOption: {
            dateSerializationFormat:"yyyy-MM-dd",
            columnAutoWidth: true,
            columns:[
                { dataField: "ID_EMP", caption: "单号", allowEditing: false, allowSorting: false },
                { dataField: "DATE_PLAN", caption: "计划开始日期", allowEditing: false, allowSorting: false, dataType: "date", format:"yyyy-MM-dd" },
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

                var view = "EMPEdit?ID_EMP=" + selectedData.ID_EMP;
                DMAPP.app.navigate(view);
            }
        }
    };

    function GetListWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetListWinbox?UserName=" + u + "&FUNCID=EMS_T_EMP@GDAPR";

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
        var filterString = "CODE_EQP='" + params.CODE_EQP + "' and STATUS='TSPT'";
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

    return viewModel;
};