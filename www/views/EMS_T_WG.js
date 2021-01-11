DMAPP.EMS_T_WG = function (params) {
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
            items: [
                {
                    id: "ID_WO",
                    label: { text: "加工批号" },
                    dataField: "ID_WO",
                    colSpan: 1
                },
                {
                    id: "CODE_OP",
                    label: { text: "加工工序" },
                    dataField: "CODE_OP",
                    editorOptions: {
                        readOnly: false,
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_OP", "BMAINBLOCK");
                        }
                    },
                    dataWindow: true,
                    colSpan: 1
                },
                {
                    id: "WEIGHT",
                    label: { text: "重量" },
                    dataField: "WEIGHT",
                    editorType:"dxNumberBox",
                    editorOptions: {
                        readOnly: false
                    },
                    validationRules: [{
                        type: "required",
                        message: "请填写重量"
                    }, {
                        type: "range",
                        max: 400,
                        message: "最大值不能超过400"
                    }],
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
        onScan: function () {
            try {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        if (result.text == null || result.text == "") {
                            return;
                        }
                        var form = $("#formMain").dxForm("instance");
                        form.option("formData.ID_WO", result.text);
                    },
                    function (error) {
                        DevExpress.ui.notify(SysMsg.scanFailed + error, "error", 3000);
                    }
                );
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
            tile = "称重";
        }
        else {
            tile = "Weighing";
            form.itemOption("ID_WO", "label", { text: "Work Order No." });
            form.itemOption("CODE_OP", "label", { text: "Operation Code" });
            form.itemOption("WEIGHT", "label", { text: "Weight" });
        }

        viewModel.title(tile);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
        var postData = {
            userName: u,
            func: "EMS_T_WG",
            group: "GDRAFT"
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

            var par = { _noback: "1" };
            var result = ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", par);
            if (result == true) {
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                viewModel.keepCache = false;
                GetWinbox(viewModel, params);
            }
        }
    }

    return viewModel;
};