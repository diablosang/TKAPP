DMAPP.EMS_T_PQC = function (params) {
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
            var par = "";
            if (params.DEVPARAM == "51") {
                par = SysMsg.cpjy;
            }
            else if (params.DEVPARAM == "52") {
                par = SysMsg.cpjyjl;
            }
            else if (params.DEVPARAM == "53") {
                par = SysMsg.fljy;
            }
            else if (params.DEVPARAM == "54") {
                par = SysMsg.fljyjl;
            }
            else if (params.DEVPARAM == "55") {
                par = SysMsg.nddj;
            }

            var tile = params.CODE_EQP + par;
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
                    id:"TYPE_OP",
                    label: { text: SysMsg.cslx },
                    dataField: "TYPE_OP",
                    editorType: "dxLookup",
                    editorOptions: {
                        readOnly: true,
                        displayExpr: "DES1",
                        valueExpr: "IDLINE",
                        dataSource: [
                            { IDLINE: "51", DES1: SysMsg.cpjy },
                            { IDLINE: "52", DES1: SysMsg.cpjyjl},
                            { IDLINE: "53", DES1: SysMsg.fljy},
                            { IDLINE: "54", DES1: SysMsg.fljyjl },
                            { IDLINE: "55", DES1: SysMsg.nddj }
                        ]
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
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/SUBMIT.jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            },
        },
    };

    function SetLanguage() {
        if (DeviceLang() == "CHS") {

        }
        else {

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
                func: "EMS_T_PQC",
                group: "GDRAFT",
                initdata: {
                    CODE_EQP: params.CODE_EQP,
                    CODE_OP: params.CODE_OP,
                    TYPE_OP: params.DEVPARAM
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
                var items = form.option("items");

                if (params.DEVPARAM == "51" || params.DEVPARAM == "53") {
                    var item1 = {
                        label: { text: SysMsg.cc },
                        dataField: "SIZE",
                        colSpan: 1
                    }

                    var item2 = {
                        label: { text: SysMsg.yd },
                        dataField: "ROUND",
                        colSpan: 1
                    }

                    var item3 = {
                        label: { text: SysMsg.pzj },
                        dataField: "PZJ",
                        colSpan: 1
                    }
                    var item4 = {
                        label: { text: SysMsg.bmmj },
                        dataField: "SURFACE",
                        colSpan: 1
                    }
                    var item5 = {
                        label: { text: SysMsg.burn },
                        dataField: "BURN",
                        colSpan: 1
                    }
                    items.push(item1);
                    items.push(item2);
                    items.push(item3);
                    items.push(item4);
                    items.push(item5);
                }
                else if (params.DEVPARAM == "55") {
                    var item1 = {
                        label: { text: SysMsg.scz },
                        dataEditor:"dxNumber",
                        dataField: "SIZE",
                        colSpan: 1
                    }

                    var item2 = {
                        label: { text: SysMsg.min },
                        dataEditor: "dxNumber",
                        dataField: "MIN",
                        colSpan: 1
                    }

                    var item3= {
                        label: { text: SysMsg.max },
                        dataEditor: "dxNumber",
                        dataField: "MAX",
                        colSpan: 1
                    }
                    items.push(item1);
                    items.push(item2);
                    items.push(item3);
                }
                else {
                    var item1 = {
                        label: { text: SysMsg.jl },
                        dataField: "RESULT",
                        editorType: "dxLookup",
                        editorOptions: {
                            displayExpr: "DES1",
                            valueExpr: "IDLINE",
                            dataSource: [
                                { IDLINE: "合格", DES1: SysMsg.hg },
                                { IDLINE: "不合格", DES1: SysMsg.bhg },
                            ]
                        },
                        colSpan: 1
                    }

                    var item2 = {
                        label: { text: SysMsg.yj },
                        dataField: "COMMENT",
                        colSpan: 1
                    }
                    items.push(item1);
                    items.push(item2);
                }

                form.option("items", items);

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