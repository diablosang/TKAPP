DMAPP.EMS_T_PAREP = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'SUBMIT', options: { text: SysMsg.submit } },
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            SetLanguage();
            //GetAsapmentListData(["TP_EMS_T_PAREP"]);
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
                getQPdata();
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
        formOption:{
            items: [],
            onFieldDataChanged: function (e) {
                //if (this.keepCache == true) {
                //    MainValueChanged(viewModel, e);
                //}
            }
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "SUBMIT" }
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
    function getQPdata() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_PARIT.GetQcParameters",
            param: params.CODE_EQP + ";DE"
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                BindData(data);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
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
    function BindData(data) {
        var items = [
            {
                label: { text: SysMsg.cslx },
                dataField: "cslx",
                editorType: "dxLookup",
                editorOptions: {
                    displayExpr: "DESC_QP",
                    valueExpr: "ID_QP",
                    dataSource: data,
                    onValueChanged: QpChanged
                },
            },
            {
                itemType: "group",
                caption: " ",
                cssClass: "form_items",
                name: "form_items",
                items: [
                ]
            },
        ]
        var form = $("#formMain").dxForm("instance");
        form.option("items", items);
    }
    var cslx = null;
    var paramArr = [];
    function QpChanged(e) {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_PARIT.GetEMS_B_QPD",
            param: e.value
        }
        cslx = e.value;
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus, e) {
                var items = [];
                for (var i = 0; i < data.length; i++) {
                    var o = data[i];
                    paramArr.push(o.LINE_QPD);
                    items.push({
                        label: { text: o.PARAMETER },
                        editorType: "dxTextBox",
                        dataField: o.LINE_QPD,
                    });
                }

                $("#formMain").dxForm("instance").itemOption("form_items", "items", items);
                $("#formMain").dxForm("instance").option('cslx', cslx);


                //$("#formMain").dxForm("instance").repaint();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_T_PAREP",
                group: "GADMIN",
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
        var obj = $("#formMain").dxForm("instance").option("formData");
        var u = sessionStorage.getItem("username");
        var items = [];
        paramArr.forEach(function (prop) {
            var value = obj[prop];
            if (value) {
                items.push({
                    PARA: cslx + "-" + prop,
                    VALUE: value
                })
            }
        })
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_PAREP.SaveParameterData",
            param: params.CODE_OP + ";" + params.CODE_EQP,
            data: items
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.Success) {
                    $("#formMain").dxForm("instance").option("formData", {});
                    DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};