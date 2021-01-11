DMAPP.TRFEdit = function (params) {
    "use strict";


    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'BTNSUBMIT', text: '提交' }],
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
                BarItemClick(e);
            }
        },
        winbox: {},
        group: ko.observable(""),
        keepCache: false,
        viewShown: function (e) {
            viewModel.title(params.ID_EMP);

            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                try {
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
                }
                catch (e) {

                }

                viewModel.keepCache = true
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
            colCount: 3,
            items: [
                {
                    label: { text: SysMsg.codeloc },
                    dataField: "CODE_LOC",
                    //editorOptions: {
                    //    onFocusIn: function (e) {
                    //        OpenDataWindow(this, "CODE_LOC", "BMAINBLOCK");
                    //    }
                    //},
                    colSpan: 3
                },
                {
                    label: { text: SysMsg.woid },
                    dataField: "ID_WO",
                    colSpan: 3
                },
                {
                    label: { text: SysMsg.qty },
                    dataField: "QTY_STK",
                    editorType: "dxNumberBox",
                    colSpan: 3
                },
                {
                    label: { text: SysMsg.remark },
                    dataField: "REMARK",
                    colSpan: 3
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
    };

    function InitView(viewModel, params) {
        var form = $("#formMain").dxForm("instance");
        if (params.TYPE == "CG") {
            form.itemOption("CODE_RITEM", "visible", true);
        }
        else {
            form.itemOption("CODE_RITEM", "visible", false);
        }
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        viewModel.keepCache = false;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
        var postData = {
            userName: u,
            func: "MFG_T_TRF",
            group: "GADMIN",
            initdata: {}
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
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
        }

        var par = { _noback: "1" };
        var result = ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", par);
        if (result == true) {
            DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
            var form = $("#formMain").dxForm("instance");
            var formData = form.option("formData");
            var loc = formData.CODE_LOC;
            GetWinbox(viewModel, params);
            form.updateData("CODE_LOC", loc);
        }
    }

    return viewModel;
};