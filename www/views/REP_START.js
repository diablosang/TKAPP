DMAPP.REP_START = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        tileBarOption: {
            items: [{ name: 'SUBMIT', text: SysMsg.submit }],
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
            items: [
                {
                    label: { text: SysMsg.remark },
                    dataField: "REMARK",
                    editorType:"dxTextArea"
                }
            ]
        },
        viewShown: function (e) {
            this.title(params.CODE_EQP);
        }
    };

    function BarItemClick(e) {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var formMain = $("#formMain").dxForm("instance");
        var formData = formMain.option("formData");
        var remark = formData.REMARK.replace(";","@SE@");

        var method = params.DEVPARAM;

        var postData = {
            userName: u,
            methodName: "EMS.EMS_REP." + method,
            param: params.CODE_EQP + ";" + remark
        }


        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                viewModel.indicatorVisible(false);
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