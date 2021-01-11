DMAPP.EMS_PRO_MAT = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                { location: 'before', widget: 'button', name: 'A31', options: { text: '提交' } },
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            var tile = params.CODE_EQP + "辅料" + (params.DEVPARAM == "PRO_MAT1" ? "添加" : "更换");
            viewModel.title(tile);

            var form = $("#formMain").dxForm("instance");
            form.option("formData", { REMARK: "", OTHER: ""});
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        formOption: {
            formData: {
                REMARK: "",OTHER:""
            },
            items: [
                {
                    label: { text: SysMsg.remark },
                    dataField: "REMARK",
                    colSpan: 1
                },
                {
                    label: { text: SysMsg.other },
                    dataField: "OTHER",
                    colSpan: 1
                }
            ]
        },
        tileBarOption: {
            items: [
                { DES: "提交", name: "BTNSUBMIT" }
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

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url;
        if (params.NEW == "1") {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
            var postData = {
                userName: u,
                func: "EMS_PRO_MAT",
                group: "GDRAFT",
                initdata: {
                    CODE_EQP: params.CODE_EQP,
                    CODE_OP: params.CODE_OP,
                    TYPE_MAT: params.DEVPARAM
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
                    DevExpress.ui.notify("无法读取数据", "error", 1000);
                }
            }
        });
    }

    function BarItemClick(e) {
        switch (params.DEVPARAM) {
            case "PRO_MAT1": PRO_MAT1(); break;
            case "PRO_MAT2": PRO_MAT2(); break;
        }
    }

    function PRO_MAT1() {
        var form = $("#formMain").dxForm("instance");
        var fromData = form.option("formData");
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_PRO_MAT.Add",
            param: params.CODE_EQP + ";" + params.CODE_OP + ";" + fromData.REMARK.replace(";", "@SE@") + ";" + fromData.OTHER.replace(";", "@SE@")
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function PRO_MAT2() {
        var form = $("#formMain").dxForm("instance");
        var fromData = form.option("formData");

        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_PRO_MAT.Replace",
            param: params.CODE_EQP + ";" + params.CODE_OP + ";" + fromData.REMARK.replace(";", "@SE@") + ";" + fromData.OTHER.replace(";", "@SE@")
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }


    return viewModel;
};