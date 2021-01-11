DMAPP.CK_T_QP = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'SUBMIT', text: '提交' },{ name: 'FINISH', text: '完成' }],
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
        data: [],
        idx:0,
        keepCache: false,
        viewShown: function (e) {
            viewModel.title(params.CODE_EQP+"质检记录");

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
            var cache = DMAPP.app.viewCache;
            cache.removeView(e.viewInfo.key);
        },
        formOption: {
            colCount: 2,
            items: [
                {
                    label: { text: "零件号" },
                    dataField: "CODE_ITEM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "工序" },
                    dataField: "CODE_OP",
                    editorOptions: {
                        readOnly:true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "计数" },
                    dataField: "CT",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                }
            ]
        },
        formOption2: {
            colCount: 2,
            items: [
                {
                    label: { text: "检验类型" },
                    editorType: "dxLookup",
                    editorOptions: {
                        readOnly: true,
                        displayExpr: "DES",
                        valueExpr: "IDLINE",
                        dataSource: [
                            { IDLINE: "0", DES: "首检" },
                            { IDLINE: "1", DES: "正常" },
                            { IDLINE: "2", DES: "回滚" }
                        ]
                    },
                    dataField: "TYPE_QPD",
                    colSpan: 1
                },
                {
                    label: { text: "等级" },
                    dataField: "RANK_SIZE",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "项目" },
                    dataField: "ITEM",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "检验方法" },
                    dataField: "WAY_CHK",
                    editorOptions: {
                        readOnly: true
                    },
                    colSpan: 1
                },
                {
                    label: { text: "检验值" },
                    dataField: "VAL_ACT",
                    colSpan: 1
                },
            ]
        },
    };

    function InitView(viewModel, params) {
        GetWinbox(viewModel, params);
    }

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        viewModel.keepCache = false;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_QP.GetQP",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var formMain = $("#formMain").dxForm("instance");
                formMain.option("formData", data[0]);
                GetNext();

                viewModel.keepCache = true;
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function GetNext() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_QP.GetNext",
            param: ""
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var formMain = $("#formMain").dxForm("instance");
                var formMain2 = $("#formMain2").dxForm("instance");
                viewModel.data = data;
                viewModel.idx = 0;
                formMain2.option("formData", data[0]);
                formMain.updateData("CT", data[0].SEQ);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BarItemClick(e) {
        if (e.itemData.name == "SUBMIT") {
            SUBMIT();
        }
        else if (e.itemData.name == "FINISH") {
            FINISH();
        }
    }

    function SUBMIT() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var formMain2 = $("#formMain2").dxForm("instance");
        var formData = formMain2.option("formData");
        var val = formData.VAL_ACT;
        if (val == null || val == "") {
            ServerError("请填写检验值");
            return;
        }


        var postData = {
            userName: u,
            methodName: "EMS.EMS_QP.SubmitResult",
            param: formData.LINE_QPD + ";" + val
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                if (data.Message == "1") {
                    DevExpress.ui.notify("检验合格", "success", 1000);
                }
                else {
                    ServerError("检验不合格");
                }

                var formMain = $("#formMain").dxForm("instance");
                var formMain2 = $("#formMain2").dxForm("instance");
                if (viewModel.idx < viewModel.data.length - 1) {
                    viewModel.idx = viewModel.idx + 1;
                    var nextData = viewModel.data[viewModel.idx];
                    formMain2.option("formData", nextData);
                    formMain.updateData("CT", nextData.SEQ);
                }
                else {
                    GetNext();
                }

                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });

    }

    function FINISH() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_QP.Submit",
            param: ""
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};