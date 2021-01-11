DMAPP.EMS_PRO_END = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'BTNSUBMIT', options: { text: SysMsg.submit } }
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            var tile = params.CODE_EQP + "下料";
            viewModel.title(tile);
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
                        if (param.blockID == "BMAINBLOCK") {
                            UpdateDataWindow(this);
                        }
                        else {
                            UpdateGridDataWindow(this, "gridDetail");
                        }
                    }
                }
                return;
            }

            try {
                GetWinbox(this, params);
            }
            catch (e) {
                DevExpress.ui.notify(SysMsg.noDetail, "error", 1000);
            }
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        formOption: {
            items: [
                {
                    id: "CODE_OP",
                    label: { text: "加工工序" },
                    dataField: "CODE_OP",
                    editorOptions: {
                        readOnly:true
                    },
                    dataWindow: true,
                    colSpan: 1
                },
                {
                    id: "ID_WO",
                    label: { text: "下料批号" },
                    dataField: "ID_WO",
                    colSpan: 1
                },
                {
                    id: "BOXID",
                    label: { text: "箱号" },
                    dataField: "BOXID",
                    colSpan: 1
                },
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "BTNSUBMIT" },
                { DES: SysMsg.submit0, name: "BTNSUBMIT0" }
            ],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 6,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.DES +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/SUBMIT.jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            },
        },
    };

    function SetLanguage() {
        var tile;
        var form = $("#formMain").dxForm("instance");
        if (DeviceLang() == "CHS") {
            tile = params.CODE_EQP + "下料";
        }
        else {
            tile = params.CODE_EQP + "Unloading";
            form.itemOption("ID_WO", "label", { text: "Work Order No." });
            form.itemOption("CODE_OP", "label", { text: "Operation Code" });
            form.itemOption("BOXID", "label", { text: "Box No." });
        }

        viewModel.title(tile);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_PRO_END",
                group: "GDRAFT",
                initdata: {
                    CODE_EQP: params.CODE_EQP,
                    CODE_OP:params.CODE_OP
                }
            }
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.winbox = data;
                var form = $("#formMain").dxForm("instance");

                for (var i = 0; i < data.length; i++) {
                    if (data[i].IDNUM == "BMAINBLOCK") {
                        form.option("formData", data[i].data[0]);
                        form.repaint();
                    }
                }
                
                viewModel.keepCache = true;
                GetID_WO();
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify(SysMsg.nodata, "error", 1000);
                }
            }
        });
    }

    function GetID_WO() {
        var form = $("#formMain").dxForm("instance");
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_PRO_END.GetID_WO",
            param: params.CODE_EQP + ";" + params.CODE_OP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.length > 0) {
                    var form = $("#formMain").dxForm("instance");
                    form.updateData("ID_WO", data[0].ID_WO);
                    form.repaint();
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BarItemClick(e) {
        if (e.itemData.needComment == "1") {
            this.commentVisible(true);
            this.comment(e.itemData.options.text);
            this.commentButton(e.itemData.name);
        }
        else {
            if (e.itemData.EXTPROP != null) {
                if (e.itemData.EXTPROP.RUNAT == "DEVICE") {
                    ButtonClickDevice(e.itemData);
                    return;
                }
            }

            ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
        }
    }

    return viewModel;
};