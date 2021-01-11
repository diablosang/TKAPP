DMAPP.WorkShop = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        versionChecked: ko.observable(false),
        indicatorVisible: ko.observable(false),
        viewShown: function () {
            SetLanguage();

            try {
                if (device.platform != "Android") {
                    window.JPush.resetBadge();
                }
            }
            catch (e)
            { }


            viewModel.indicatorVisible(true);
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            if (u == null) {
                var view = "Login/1";
                var option = { root: true };
                DMAPP.app.navigate(view, option);
                return;
            }

            BindData(this);
        },
        itemData: new DevExpress.data.DataSource({
            store: [],
            group: function (dataItem) {
                return dataItem.DISP_WS;
            }
        }),
        itemDataSearch: new DevExpress.data.DataSource({
            store: []
        }),
        listOption: {
            dataSource: this.itemData,
            height: "100%",
            grouped: true,
            collapsibleGroups: true,
            onItemClick: function (e) {
                var data = e.itemData;
                var CODE_LINE = data.CODE_LINE;
                var DESC_LINE = data.DESC_LINE;
                OpenDoc(CODE_LINE, DESC_LINE);
            }
        },
        listSearchOption: {
            dataSource: this.itemDataSearch,
            height: "100%",
            onItemClick: function (e) {
                var popup = $("#popSearch").dxPopup("instance");
                popup.hide();
                var data = e.itemData;
                var CODE_EQP = data.CODE_EQP;
                var view = "DeviceInfo?CODE_EQP=" + CODE_EQP;
                DMAPP.app.navigate(view);
            }
        },
        onScrollViewPullingDown: function (e) {
            BindData(this);
            e.component.release();
        },
        toolBarOption: {
            items: [
               { location: 'before', widget: 'button', name: 'find', options: { icon: 'find', text: '' } }
            ],
            onItemClick: function (e) {
                switch (e.itemData.name) {
                    case "find":
                        {
                            var popup = $("#popSearch").dxPopup("instance");
                            popup.show();
                            break;
                        }
                }
            }
        },
        searchPopupOption: {
            title: '',
            showTitle: true,
            visible: false,
            toolbarItems:
               [{
                   location: 'center', options: {
                       text: '执行查找',
                       icon: 'find',
                       onClick: function (e) {
                           SearchData(viewModel);
                       }
                   }, widget: 'dxButton'
               }]
        },
        buttonGoClick: function (e) {
            OpenDevice(viewModel);
        }
    };
    return viewModel;

    function OpenDevice(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var searchText = $("#txtCODE_EQP").dxTextBox("instance");
            var CODE_EQP = searchText.option("value");
            var postData = {
                userName: u,
                sql: "select * from V_EMS_T_EQP where CODE_EQP='"+CODE_EQP+"'"
            };

            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData";
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                cache: false,
                success: function (data, textStatus) {
                    if(data.length==0){
                        DevExpress.ui.notify("该设备号不存在", "error", 1000);
                        return;
                    }

                    var view = "DeviceInfo?CODE_EQP=" + CODE_EQP;
                    DMAPP.app.navigate(view);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var postData = {
                userName: u,
                sql: "select * from V_MFG_B_LINE"
            };

            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData";
            $.ajax({
                type: 'POST',
                url: url,
                data:postData,
                cache: false,
                success: function (data, textStatus) {
                    viewModel.itemData.store().clear();

                    for (var i = 0; i < data.length; i++) {
                        viewModel.itemData.store().insert(data[i]);
                    }
                    viewModel.itemData.load();

                    $("#listDash").dxList({
                        dataSource: viewModel.itemData
                    });
                    viewModel.indicatorVisible(false);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function SearchData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var searchText = $("#txtSearch").dxTextBox("instance");
            var filter = searchText.option("value");
            var postData = {
                userName: u,
                sql: "select * from V_EMS_T_EQP where CODE_EQP like '%" + filter + "%' or DESC_DISP1 like '%" + filter + "%' or DESC_DISP2 like '%"+filter+"%'"
            };

            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData";
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                cache: false,
                success: function (data, textStatus) {
                    viewModel.itemDataSearch.store().clear();

                    for (var i = 0; i < data.length; i++) {
                        viewModel.itemDataSearch.store().insert(data[i]);
                    }
                    viewModel.itemDataSearch.load();

                    $("#listSearch").dxList({
                        dataSource: viewModel.itemDataSearch
                    });
                    viewModel.indicatorVisible(false);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function OpenDoc(CODE_LINE,DESC_LINE) {
        var view = "DeviceTable?CODE_LINE=" + CODE_LINE + "&DESC_LINE=" + DESC_LINE;
        DMAPP.app.navigate(view);
    }

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            viewModel.title("产线列表");
        }
        else {
            viewModel.title("Product Line");
        }
    }
};