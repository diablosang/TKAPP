DMAPP.EMS_PRO_START20 = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            SetLanguage();
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
            colCount:2,
            items: [
                {
                    id: "CODE_BAR",
                    label: { text: "条码" },
                    dataField: "CODE_BAR",
                    colSpan: 2
                },
                {
                    id: "CODE_ICATE",
                    label: { text: "规格" },
                    dataField: "CODE_ICATE",
                    colSpan: 1,
                    dataWindow: true,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_ICATE", "BMAINBLOCK");
                        }
                    }
                },
                {
                    id: "CODE_CLASS",
                    label: { text: "材料" },
                    dataField: "CODE_CLASS",
                    colSpan: 1,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_CLASS", "BMAINBLOCK");
                        }
                    }
                },
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
                    id: "QTY_STK",
                    label: { text: "重量" },
                    dataEditor: "dxNumber",
                    dataField: "QTY_STK",
                    colSpan: 1,
                    editorOptions: {
                        readOnly: false
                    }
                }
                
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
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.DES + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            },
        },
        onScan: function () {
            try {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        if (result.text == null || result.text == "") {
                            return;
                        }
                        var form = $("#formMain").dxForm("instance");
                        form.option("formData.CODE_BAR", result.text);
                    },
                    function (error) {
                        DevExpress.ui.notify(SysMsg.scanFailed + error, "error", 3000);
                    }
                );
                //var form = $("#formMain").dxForm("instance");
                //form.option("formData.CODE_BAR", "0001,CL-090-SW-X2,T900512K,1702,66110");
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }
        }
    };

    function SetLanguage() {
        var tile;
        var form = $("#formMain").dxForm("instance");
        if (DeviceLang() == "CHS") {
            tile = params.CODE_EQP + "冷镦上料";
        }
        else {
            tile = params.CODE_EQP + "Loading OP.20";
            form.itemOption("CODE_BAR", "label", { text: "Barcode" });
            form.itemOption("CODE_ICATE", "label", { text: "Spec." });
            form.itemOption("CODE_CLASS", "label", { text: "Material" });
            form.itemOption("CODE_ITEM", "label", { text: "Item Code" });
            form.itemOption("CODE_LOT", "label", { text: "Lot No." });
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
                func: "EMS_PRO_START20",
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