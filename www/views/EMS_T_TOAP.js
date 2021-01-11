DMAPP.EMS_T_TOAP = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'A30', text: '提交' }],
            direction: 'vertical',
            height: "100%",
            baseItemHeight: 192,
            baseItemWidth: 192,
            itemMargin: 10,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.text +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.text + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.name == "A30") {
                    SUBMIT(e);
                }
            }
        },
        winbox: {},
        group: ko.observable(""),
        keepCache: false,
        viewShown: function (e) {
            viewModel.title(params.ID_EMP);

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
                viewModel.keepCache = true;
                return;
            }

            try {
                InitView(this, params);
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        viewHidden: function (e) {
            //if (viewModel.keepCache == false) {
            //    var cache = DMAPP.app.viewCache;
            //    cache.removeView(e.viewInfo.key);
            //}
        },
        formOption: {
            colCount: 1,
            items: [
                {
                    label: { text: "物料代码" },
                    dataField: "CODE_ITEM",
                    editorOptions: {
                        onFocusIn: function (e) {
                            OpenDataWindow(this, "CODE_ITEM", "BMAINBLOCK");
                        }
                    },
                    colSpan: 1
                },
                {
                    label: { text: "物料描述" },
                    dataField: "DESC_ITEM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "规格" },
                    dataField: "SPEC_ITEM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "型号" },
                    dataField: "MODEL_ITEM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "单位" },
                    dataField: "UM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "申领数量" },
                    dataField: "QTY_APPLY",
                    editorType: "dxNumberBox",
                    colSpan: 1
                },
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        }
    };

    function InitView(viewModel, params) {
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple";       
        var postData = {
            userName: u,
            func: "EMS_T_TOAP",
            group: "GNDRF",
            initdata: { CODE_EQP: params.CODE_EQP}
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

    function SUBMIT(e) {
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
        var qty = formData.QTY_APPLY;
        if (qty == null || qty == "" || qty == "0")
        {
            ServerError("领用数量不能为0");
            return;
        }

        ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
    }
    return viewModel;
};