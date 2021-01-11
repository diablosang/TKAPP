DMAPP.EMS_T_PAR = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                 { location: 'before', widget: 'button', name: 'A31', options: { text: SysMsg.submit } },
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
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
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
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
                    id: "VAL_31",
                    label: { text: SysMsg.yl },
                    dataField: "VAL_31",
                    editorType: "dxNumberBox",
                    colSpan: 1
                },
                {
                    id: "VAL_32",
                    label: { text: SysMsg.zz },
                    dataField: "VAL_32",
                    editorType: "dxNumberBox",
                    colSpan: 1
                },
                {
                    id: "VAL_33",
                    label: { text: SysMsg.lp },
                    dataField: "VAL_33",
                    editorType: "dxNumberBox",
                    colSpan: 1
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
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/SUBMIT.jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            },
        },
    };

    function SetLanguage() {
        var par = "";
        var form = $("#formMain").dxForm("instance");
        if (DeviceLang() == "CHS") {
            if (params.DEVPARAM == "31") {
                par = "压力";
            }
            else if (params.DEVPARAM == "32") {
                par = "主轴转速";
            }
            else if (params.DEVPARAM == "33") {
                par = "料盘转速";
            }

            //var tile = params.CODE_EQP + "设置参数-" + par;
            var tile = params.CODE_EQP + "设置参数";
            viewModel.title(tile);
        }
        else {
            if (params.DEVPARAM == "31") {
                par = "Pressure";
            }
            else if (params.DEVPARAM == "32") {
                par = "RPM Spindle";
            }
            else if (params.DEVPARAM == "33") {
                par = "RPM Turntable";
            }

            //var tile = params.CODE_EQP + "Machine Data - " + par;
            var tile = params.CODE_EQP + "Machine Data";
            viewModel.title(tile);

            //form.itemOption("TYPE_OP", "label", { text: "Type" });
            //form.itemOption("VAL_PAR", "label", { text: "Value" });
        }
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_T_PAR",
                group: "GDRAFT",
                initdata: {
                    CODE_EQP: params.CODE_EQP,
                    CODE_OP: params.CODE_OP
                    //TYPE_OP: params.DEVPARAM
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