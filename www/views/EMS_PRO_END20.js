DMAPP.EMS_PRO_END20 = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'BTNSUBMIT', options: { text: SysMsg.submit } },
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            var tile = params.CODE_EQP + "冷墩下料";
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
            colCount: 2,
            items: [
                {
                    id: "CODE_ITEM",
                    label: { text: "物料号" },
                    dataField: "CODE_ITEM",
                    colSpan: 1,
                    dataWindow: true,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_ITEM", "BMAINBLOCK");
                        }
                    }
                },
                {
                    id: "CODE_LOT",
                    label: { text: "炉号" },
                    dataField: "CODE_LOT",
                    colSpan: 1,
                    editorOptions: {
                        readOnly: true
                    }
                },
                {
                    id: "F_CLS",
                    label: { text: "是否全部下料" },
                    dataField: "F_CLS",
                    colSpan: 1,
                    editorType: "dxCheckBox",
                },
                {
                    itemType: "empty",
                    colSpan: 1
                },
                {
                    id: "BOX1",
                    label: { text: "箱号1" },
                    dataField: "BOX1",
                    colSpan: 1
                }
                //{
                //    id: "BOX2",
                //    label: { text: "箱号2" },
                //    dataField: "BOX2",
                //    colSpan: 1
                //},
                //{
                //    id: "BOX3",
                //    label: { text: "箱号3" },
                //    dataField: "BOX3",
                //    colSpan: 1
                //},
                //{
                //    id: "BOX4",
                //    label: { text: "箱号4" },
                //    dataField: "BOX4",
                //    colSpan: 1
                //},
                //{
                //    id: "BOX5",
                //    label: { text: "箱号5" },
                //    dataField: "BOX5",
                //    colSpan: 1
                //},
                //{
                //    id: "BOX6",
                //    label: { text: "箱号6" },
                //    dataField: "BOX6",
                //    colSpan: 1
                //}
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "BTNSUBMIT" }
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
            tile = params.CODE_EQP + "冷镦下料";
        }
        else {
            tile = params.CODE_EQP + "Unloading OP.20";
            form.itemOption("CODE_ITEM", "label", { text: "Item Code" });
            form.itemOption("CODE_OP", "label", { text: "Lot No." });
            form.itemOption("BOX1", "label", { text: "Box 1" });
            form.itemOption("BOX2", "label", { text: "Box 2" });
            form.itemOption("BOX3", "label", { text: "Box 3" });
            form.itemOption("BOX4", "label", { text: "Box 4" });
            form.itemOption("BOX5", "label", { text: "Box 5" });
            form.itemOption("BOX6", "label", { text: "Box 6" });
            form.itemOption("F_CLS", "label", { text: "If all download" });
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
                func: "EMS_PRO_END20",
                group: "GDRAFT",
                initdata: {
                    CODE_EQP: params.CODE_EQP
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