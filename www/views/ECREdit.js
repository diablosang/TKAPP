DMAPP.ECREdit = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        toolBarOption: {
            items: [
                 { location: 'before', widget: 'button', name: 'save', options: { text: '保存' } },
                  { location: 'before', widget: 'button', name: 'close', options: { text: '结束' } },
            ],
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            viewModel.title(params.ID_ECR);
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
                    itemType: "group",
                    colCount: 4,
                    caption: "换型信息",
                    items: [
                        {
                            label: { text: "ID" },
                            dataField: "ID_ECR",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 1
                        },
                        {
                            label: { text: "执行人" },
                            dataField: "CREUSR",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 1
                        },
                        {
                            label: { text: "版本" },
                            dataField: "VERSION",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 1
                        },
                        {
                            itemType: "empty",
                            colSpan: 3
                        },
                        {
                            label: { text: "开始时间" },
                            dataField: "TIME_START",
                            editorType: "dxDateBox",
                            editorOptions: {
                                formatString: "yyyy-MM-dd HH:mm",
                                pickerType: "calendar",
                                dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss"
                            },
                            colSpan: 2
                        },
                        {
                            label: { text: "结束时间" },
                            dataField: "TIME_END",
                            editorType: "dxDateBox",
                            editorOptions: {
                                readOnly:true,
                                formatString: "yyyy-MM-dd HH:mm",
                                pickerType: "calendar",
                                dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss"
                            },
                            colSpan: 2
                        },
                        {
                            label: { text: "工单" },
                            dataField: "ID_WO",
                            colSpan: 1
                        },
                        {
                            label: { text: "工序" },
                            dataField: "CODE_OP",
                            colSpan: 1
                        },
                        {
                            label: { text: "当前零件" },
                            dataField: "CODE_ITEM",
                            colSpan: 1
                        },
                        {
                            itemType: "empty",
                            colSpan: 1
                        },
                        {
                            label: { text: "更换工单" },
                            dataField: "ID_CWO",
                            colSpan: 1
                        },
                        {
                            label: { text: "更换工序" },
                            dataField: "CODE_COP",
                            colSpan: 1
                        },
                        {
                            label: { text: "更换零件" },
                            dataField: "CODE_CITEM",
                            colSpan: 1
                        },
                        {
                            itemType: "empty",
                            colSpan: 1
                        }
                    ]
                },
                {
                    itemType: "group",
                    colCount: 4,
                    caption: "检验信息",
                    items: [
                        {
                            label: { text: "送检数量" },
                            dataField: "IQ_ECR",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 1
                        },
                        {
                            label: { text: "不良数量" },
                            dataField: "UQ_ECR",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 1
                        },
                        {
                            label: { text: "判定结果" },
                            dataField: "JR_ECR",
                            editorType: "dxLookup",
                            editorOptions: {
                                readOnly: true,
                                displayExpr: "DES1",
                                valueExpr: "IDLINE",
                                dataSource: [
                                    { IDLINE: "10", DES1: "未检" },
                                    { IDLINE: "20", DES1: "合格" },
                                    { IDLINE: "30", DES1: "不合格" }
                                ],
                            },
                            colSpan: 1
                        },
                        {
                            itemType: "empty",
                            colSpan: 1
                        },
                        {
                            label: { text: "备注" },
                            dataField: "REMARK",
                            editorOptions: {
                                readOnly: true
                            },
                            colSpan: 4
                        },
                    ]
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
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
                func: "EMS_T_ECR",
                group: "GPADLIST",
                initdata: {
                    CODE_EQP: params.CODE_EQP
                }
            }
        }
        else {
            url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetWinboxDataSimple"
            var postData = {
                userName: u,
                func: "EMS_T_ECR",
                group: "GPADLIST",
                doc: params.ID_ECR
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
                var gridDetail = $("#gridDetail").dxDataGrid("instance");

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
        switch (e.itemData.name) {
            case "close": Close(); break;
            default: {
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
                break;
            }
        }
    }

    function Close() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
        var status = formData.STATUS;
        viewModel.started = true;
        var date = GetDateTimeString();
        form.updateData("STATUS", "TCOF");

        if (formData.ID_CWO == "" || formData.ID_CWO == null || formData.CODE_COP == "" || formData.CODE_COP == null || formData.CODE_CITEM == "" || formData.CODE_CITEM == "" == null) {
            DevExpress.ui.notify("请填写必须内容", "error", 2000);
            return;
        }

        var postData = {
            userName: u,
            command: "ECR.CLOSE",
            id:formData.ID_ECR
        }
        var url = $("#WebApiServerURL")[0].value + "/Api/IRCZ/Command";
        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
                DevExpress.ui.notify("换型结束", "success", 1000);
                var cache = DMAPP.app.viewCache;
                cache.removeView(viewModel.viewKey);
                (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                if (xmlHttpRequest.responseText == "NO SESSION") {
                    ServerError(xmlHttpRequest.responseText);
                }
                else {
                    DevExpress.ui.notify("错误", "error", 1000);
                }
            }
        });
    }


    return viewModel;
};