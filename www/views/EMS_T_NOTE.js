DMAPP.EMS_T_NOTE = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(SysMsg.devicenote),
        indicatorVisible: ko.observable(false),
        keepCache: false,
        tileViewOption: {
            items: [
                { name: "BTNSUBMIT", CODE_MENU: "提交", DESC_CH: SysMsg.submit }
            ],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 6,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                var desc;
                if (DeviceLang() == "CHS") {
                    desc = itemData.DESC_CH;
                }
                else {
                    desc = itemData.DESC_EN;
                }
                itemElement.append("<div class=\"ItemDesc\">" + desc +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.CODE_MENU + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.DEVOBJ == "BACK") {
                    this.parentMenu("");
                    GetMenu(this, params);
                }
                else {
                    BarItemClick(e);
                }
            }
        },
        formOption: {
            colCount: 1,
            items: [
                {
                    label: { text: SysMsg.comment },
                    dataField: "COMMENT",
                    editorType: "dxTextArea",
                    colSpan: 1
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(this, e);
                }
                
            }
        },
        gridOption: {
            dateSerializationFormat: "yyyy-MM-ddTHH:mm:ss",
            columnAutoWidth: true,
            columns: [
                { dataField: "SID", caption: "SID", allowEditing: false, allowSorting: false },
                {
                    dataField: "CREUSR", caption: SysMsg.note_creusr, allowEditing: false, allowSorting: false, lookup: {
                        dataSource: asUserList,
                        displayExpr: "DES",
                        valueExpr: "IDNUM"
                    }
                },
                { dataField: "CREDAT", caption: SysMsg.date, allowEditing: false, allowSorting: false, dataType: "date", format: "yyyy-MM-dd HH:mm:ss" },
                { dataField: "COMMENT", caption: SysMsg.comment, allowEditing: false, allowSorting: false }
            ],
            selection: {
                mode: "single"
            },
            paging: {
                enabled: false
            }
        },
        viewShown: function (e) {
            BindData();
        }
    };

    function BindData() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
        var postData = {
            userName: u,
            func: "EMS_T_NOTE",
            group: "GNDRF",
            initdata: {
                CODE_EQP: params.CODE_EQP
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

        url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.EMS_T_NOTE.GetList",
            param: params.CODE_EQP
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var grid = $("#gridMain").dxDataGrid("instance");
                grid.option("dataSource", data);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BarItemClick(e) {
        var form = $("#formMain").dxForm("instance");
        var formData = form.option("formData");
        if (formData.COMMENT == null || formData.COMMENT == "") {
            ServerError(SysMsg.note_reqired);
            return;
        }

        ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
    }

    return viewModel;
};