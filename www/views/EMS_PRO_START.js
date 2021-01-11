DMAPP.EMS_PRO_START = function (params) {
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
                    id: "CODE_OP",
                    label: { text: "加工工序" },
                    dataField: "CODE_OP",
                    editorType: "dxLookup",
                    //editorOptions: {
                    //    readOnly: (function () {
                    //        if (params.DEVPARAM.indexOf("IR")>=0) {
                    //            return false;
                    //        }
                    //        else {
                    //            return true;
                    //        }
                    //    })(),
                    //},
                    dataWindow: false,
                    colSpan: 1
                },
                {
                    id: "ID_WO",
                    label: { text: "加工批号" },
                    dataField: "ID_WO",
                    colSpan: 1
                },
                {
                    id: "CODE_LH",
                    label: { text: "炉号" },
                    dataField: "CODE_LH",
                    visible: false,
                    colSpan: 1,
                    dataWindow: true,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_LH", "BMAINBLOCK");
                        }
                    }
                },
                {
                    id: "CODE_LH2",
                    label: { text: "炉号2" },
                    dataField: "CODE_LH2",
                    visible: false,
                    colSpan: 1,
                    dataWindow: true,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_LH2", "BMAINBLOCK");
                        }
                    }
                },
                {
                    id: "CODE_LH3",
                    label: { text: "炉号3" },
                    dataField: "CODE_LH3",
                    visible: false,
                    colSpan: 1,
                    dataWindow: true,
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_LH3", "BMAINBLOCK");
                        }
                    }
                },
            ],
            onFieldDataChanged: function (e) {
                if (e.dataField == "CODE_OP") {
                    var lhVisible = e.component.itemOption("CODE_LH").visible;

                    if (e.value == "20") {
                        if (lhVisible == false) {
                            e.component.itemOption("CODE_LH", "visible", true);
                            e.component.itemOption("CODE_LH2", "visible", true);
                            e.component.itemOption("CODE_LH3", "visible", true);
                        }
                    }
                    else {
                        if (lhVisible == true) {
                            e.component.itemOption("CODE_LH", "visible", false);
                            e.component.itemOption("CODE_LH2", "visible", false);
                            e.component.itemOption("CODE_LH3", "visible", false);
                        }
                    }
                }

                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "BTNSUBMIT" },
                { DES: SysMsg.cancel, name: "BTNCANCEL" }
            ],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 3,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.DES +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.DES+".jpg')\"></div>");
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
        if(DeviceLang()=="CHS"){
            tile = params.CODE_EQP +"上料";
        }
        else{
            tile = params.CODE_EQP + "Loading";
            form.itemOption("ID_WO", "label", { text: "Work Order No." });
            form.itemOption("CODE_OP", "label", { text: "Operation Code" });
            form.itemOption("CODE_LH", "label", { text: "Heart No." });
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
                func: "EMS_PRO_START",
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

                GetOPList();

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

    function GetOPList() {
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var postData = {
                userName: u,
                methodName: "EMS.EMS_PRO_START.GetOPList",
                param: params.CODE_EQP + ";" + params.CODE_OP
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
                var option = {
                    displayExpr: "CODE_OP",
                    valueExpr: "CODE_OP",
                    dataSource: data
                };

                if (data.length > 1) {
                    option.readOnly = false;
                }
                else {
                    option.readOnly = true;
                }

                var editor = form.itemOption("CODE_OP", "editorOptions", option);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
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