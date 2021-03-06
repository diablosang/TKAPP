﻿DMAPP.EMS_T_QC201 = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'BTNSUBMIT', text: SysMsg.submit }],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 6,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.text +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.text + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            }
        },
        formOption: {
            colCount: 2,
            items: [
                {
                    itemType: "group",
                    colCount: 1,
                    items: [
                        {
                            label: { text: "拉后尺寸" },
                            dataField: "PAR1",
                            colSpan: 1,
                        },
                        {
                            label: { text: "切料长度" },
                            dataField: "PAR2",
                            colSpan: 1,
                        },
                        //{
                        //    label: { text: "极柱直径" },
                        //    dataField: "PAR3",
                        //    colSpan: 1,
                        //},
                        {
                            label: { text: "两极高" },
                            dataField: "PAR4",
                            colSpan: 1,
                        },
                        {
                            label: { text: "环带宽" },
                            dataField: "PAR5",
                            colSpan: 1,
                        },
                        {
                            label: { text: "环带厚" },
                            dataField: "PAR6",
                            colSpan: 1,
                        }]
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        viewShown: function (e) {
            this.title(params.CODE_EQP);
            GetWinbox(viewModel, params);
        }
    };

    function GetWinbox(viewModel, params) {
        viewModel.indicatorVisible(true);
        viewModel.keepCache = false;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/NewDocSimple"
        var postData = {
            userName: u,
            func: "EMS_T_QC201",
            group: "GNDRF",
            initdata: {
                CODE_EQP: params.CODE_EQP,
            }
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
        if(e.itemData.needComment == "1") {
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
            GetWinbox(viewModel, params);

        }
    }

    return viewModel;
};