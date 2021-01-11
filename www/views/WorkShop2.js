var intervalTime = 60;
var timer = null;
DMAPP.WorkShop2 = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        versionChecked: ko.observable(false),
        indicatorVisible: ko.observable(false),
        actionSheetWGOption: {
            usePopover: true,
            target: '#btnWG',
            dataSource: [
                {
                    text: "普通称重",
                    onClick: function (e) {
                        var view = "EMS_T_WG";
                        DMAPP.app.navigate(view);
                    }
                },
                {
                    text: "冷镦称重",
                    onClick: function (e) {
                        var view = "EMS_T_WG20";
                        DMAPP.app.navigate(view);
                    }
                }
            ]
        },
        viewHidden: function () {
            clearTimeout(timer);
        },
        viewShown: function () {
            SetLanguage();

            try {
                if (device.platform != "Android") {
                    window.JPush.resetBadge();
                }
            }
            catch (e)
            { }


            viewModel.indicatorVisible(true);
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            if (u == null) {
                var view = "Login/1";
                var option = { root: true };
                DMAPP.app.navigate(view, option);
                return;
            }
            var t = window.localStorage.getItem("workshopIntervalTime");
            if (!isNaN(t))
                intervalTime = t;
            BindData(this); 
            BindFieldData();
        },
        onLogoffClick: function () {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");

            if (u == null) {
                return;
            }

            DMAPP.app.viewCache.clear();
            sessionStorage.removeItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/Logoff?UserName=" + u;
            $.ajax({
                type: 'GET',
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    var view = "Login/0";
                    var option = { root: true };
                    DMAPP.app.navigate(view, option);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });
            return;
        },
        buttonGoClick: function (e) {
            OpenDevice(viewModel);
        },
        buttonFuncClick: function (e) {
            var view = e.component.option("view");
            if (view != "")
            {
                DMAPP.app.navigate(view);
            }
        },
        buttonReportClick: function (e) {
            DMAPP.app.navigate("DMREPORT");
        },
        buttonWGClick: function (e) {
            var asWG = $("#asWG").dxActionSheet("instance");
            asWG.show();
        },
        listFieldsOption: {
            selectionMode: "all",
            keyExpr: "FIELDNAME"
        },
        popupSelectOption: {
            toolbarItems: [{
                location: 'center', options: {
                    text: '确定',
                    onClick: function (e) {
                        SelectOK();
                    }
                }, widget: 'dxButton'
            }],
            onShown: function (e) {
                var list = $("#listSelect").dxList("instance");
                list.option("dataSource", this.fieldList);
                list.unselectAll();

                var localStorage = window.localStorage;
                var selectedFields = localStorage.getItem("selectedFields");
                if (selectedFields != null) {
                    var fields = JSON.parse(selectedFields);
                    for (var i = 0; i < fields.length; i++) {
                        for (var j = 0; j < this.fieldList.length; j++) {
                            if (this.fieldList[j].FIELDNAME == fields[i]) {
                                list.selectItem(j);
                            }
                        }
                    }
                }
            }
        },
        popFromOption: {
            onShown: function (e) {
                
            }
        },
        onPopFromClick: function (e) {
            var pop = $("#popFrom").dxPopup("instance");
            pop.show();
        },
        popFromSearch: function (e) {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var idwo = $("#popFrom_ID_WO").dxTextBox("instance").option("value");
            console.log(idwo)
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
            var postData = {
                userName: u,
                methodName: "EMS.Common.GetCODE_ITEM",
                param: idwo
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    if (data.length == 0) {
                        viewModel.indicatorVisible(false);
                        ServerError(SysMsg.emptydata);
                    } else {
                        $("#popFrom_codeItem").text(data[0].CODE_ITEM)
                    }
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        },
        onFieldSelectClick: function (e) {
            var pop = $("#popSelect").dxPopup("instance");
            pop.show();
        },
        onPopFromExit: function (e) {
            var pop = $("#popFrom").dxPopup("instance");
            pop.hide();
        },
        onSelectOKClick: function (e) {

        },
        onScan: function () {
            try {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        if (result.text == null || result.text == "") {
                            return;
                        }
                        var idwo = $("#popFrom_ID_WO").dxTextBox("instance");
                        idwo.option("value", result.text);
                    },
                    function (error) {
                        DevExpress.ui.notify(SysMsg.scanFailed + error, "error", 3000);
                    }
                );
            }
            catch (e) {
                DevExpress.ui.notify(e, "error", 3000);
            }
        }
    };

    function BindFieldData() {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";

            var postData = {
                userName: u,
                methodName: "EMS.Common.GetDeviceFields",
                param: ""
            }

            $.ajax({
                type: 'POST',
                data: postData,
                url: url,
                cache: false,
                success: function (data, textStatus) {
                    viewModel.fieldList = data;
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });

            postData = {
                userName: u,
                methodName: "EMS.Common.GetColorTable",
                param: ""
            };
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                cache: false,
                success: function (data, textStatus) {
                    var table = $("#tbLegend");
                    table.empty();
                    $('<tr>').attr('id', 'trLegend').appendTo(table);
                    var tr = $("#trLegend");
                    for (var i = 0; i < data.length; i++) {
                        var desc = DeviceLang() == "CHS" ? data[i].DES1 : data[i].DES2;
                        var color = "#" + data[i].COLOR;
                        var html = "<td align='center' style='width:100px;background-color:" + color + "'>" + desc + "</td>";
                        $(html).appendTo(tr);
                    }
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }

    }
    function SelectOK() {
        var list = $("#listSelect").dxList("instance");
        var selectedFields = [];
        var fieldList = viewModel.fieldList;
        for (var i = 0; i < fieldList.length; i++) {
            if (list.isItemSelected(i)) {
                selectedFields.push(fieldList[i].FIELDNAME);
            }
        }

        var localStorage = window.localStorage;
        localStorage.setItem("selectedFields", JSON.stringify(selectedFields));
        var pop = $("#popSelect").dxPopup("instance");
        pop.hide();
        BindData();
    }
    function BindData(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            console.log(u);
            if (asRoles.indexOf("MFG_EMP") != -1) {
                //$("#divCanvas").hide();
                //生产员工角色
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";

                var postData = {
                    userName: u,
                    methodName: "EMS.Common.GetAllDeviceTable",
                    param: ''
                }
                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    cache: false,
                    success: function (data, textStatus) {
                        var divDevices = $("#tbDevice");
                        divDevices.empty();
                        var localStorage = window.localStorage;
                        var selectedFields = localStorage.getItem("selectedFields");
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            var item_div = $("<div class='div_deivce'><div>" + item.CODE_EQP + "</div></div>");
                            item_div.attr('onclick', "DeivceClick('" + item.CODE_EQP + "');");
                            item_div.css('background-color', '#' + item.COLOR);
                            if (selectedFields != null) {
                                var fields = JSON.parse(selectedFields);
                                for (var s = 0; s < fields.length; s++) {
                                    if (item[fields[s]])
                                        item_div.append("<div class='div_deivce_item'>" + item[fields[s]] + "</div>");
                                }
                            }
                            $("#tbDevice").append(item_div);
                        }
                        
                        BindBar();
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
            //非生产员工角色
            else {
                $("#tbLegend").hide();
                $("#tbDevice").hide();
                $("#dev_device").css("height", "0px");
                var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
                var postData = {
                    userName: u,
                    methodName: "EMS.Common.GetWorkShop",
                    param: ""
                }

                $.ajax({
                    type: 'POST',
                    data: postData,
                    url: url,
                    cache: false,
                    success: function (data, textStatus) {
                        var gap = 10;
                        var cols = parseInt(8);
                        var pageWidth = 400;
                        var itemWidth = parseInt((pageWidth - gap) / cols - gap);
                        var itemHeight = parseInt(itemWidth / 4 * 3);

                        var divCanvas = $("#divCanvas");
                        divCanvas.empty();
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            var itemInfo = {
                                htmlItem: "<div id='item" + item.CODE_LINE + "' class='CavItem'/>",
                                posX: (itemWidth + gap) * (item.POS_X - 1) + gap,
                                posY: (itemHeight + gap) * (item.POS_Y - 1) + gap,
                                w: itemWidth * item.SIZE_W + gap * (item.SIZE_W - 1),
                                h: itemHeight * item.SIZE_H + gap * (item.SIZE_H - 1)
                            };

                            item.itemInfo = itemInfo;
                            BindItem(item, divCanvas);
                        }

                        BindBar();
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                        viewModel.indicatorVisible(false);
                        ServerError(xmlHttpRequest.responseText);
                    }
                });
            }
            
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }

    }
    
    function BindBar() {
        clearTimeout(timer);
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetWorkShopBarAuth",
            param: ""
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                workShopBarAuth = data;
                for (var i = 0; i < workShopBarAuth.length; i++) {
                    if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1") >= 0) {
                        $("#ws_1").show();
                        continue;
                    }
                    if (workShopBarAuth[i].CODE_MENU.indexOf("WS_2") >= 0) {
                        $("#ws_2").show();
                        continue;
                    }
                    if (workShopBarAuth[i].CODE_MENU.indexOf("WS_3") >= 0) {
                        $("#ws_3").show();
                        continue;
                    }
                    if (workShopBarAuth[i].CODE_MENU.indexOf("WS_4") >= 0) {
                        $("#ws_4").show();
                        continue;
                    }
                    if (workShopBarAuth[i].CODE_MENU.indexOf("WS_5") >= 0) {
                        $("#ws_5").show();
                        continue;
                    }
                }
                if (asRoles.indexOf("MFG_EMP") != -1) {
                    $("#ws_6").show();
                }
                var t = localStorage.getItem("workshopIntervalTime");
                if (!isNaN(t)) {
                    t = 60;
                }
                //timer = setTimeout(function () {
                //    BindData(this);
                //}, t * 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function BindItem(item, divCanvas) {
        var itemInfo = item.itemInfo;
        $(itemInfo.htmlItem).appendTo(divCanvas);
        var divItem = $("#item" + item.CODE_LINE);
        divItem.css("top", itemInfo.posY).css("left", itemInfo.posX).css("width", itemInfo.w).css("height", itemInfo.h).css("background-color", "#" + item.COLOR_BG);
        divItem.addClass("item_flex");
        divItem.attr('onclick', "OpenWorkShop('" + item.CODE_LINE + "','" + item.DESC_LINE + "','" + item.TYPE + "');");
        //var color = "rgb(51, 232, 37)";
        //switch (item.TYPE) {
        //    case "01": color = "rgb(51, 232, 37)"; break;
        //    case "02": color = "yellow"; break;
        //    case "03": color = "rgb(238, 121, 89)"; break;
        //    case "04": color = "rgb(238, 121, 89)"; break;
        //    case "05": color = "rgb(245, 245, 245)"; break;
        //}
        //divItem.css("background-color", color);
        //var divBox = $("<div class='CavBox'>");
        //divBox.appendTo(divItem);

        //$("<div class='CavText'>").html(item.CODE_LINE).css("font-size", "20px").appendTo(divBox);
        //$("<div class='CavText'>").html(item.DISP_WS).appendTo(divBox);
        //$("<div class='CavText'>").html(item.DISP1).appendTo(divBox);
        //$("<div class='CavText'>").html(item.DISP2).appendTo(divBox);
        var kww = 40;
        if (itemInfo.w < 40) kww = itemInfo.w;

        var statusStr = "";
        if (item.COUNT_R > 0) statusStr += "<div class='COUNTR'>" + item.COUNT_R + "</div>";
        if (item.COUNT_S > 0) statusStr += "<div class='COUNTS'>" + item.COUNT_S + "</div>";
        if (item.COUNT_U > 0) statusStr += "<div class='COUNTU'>" + item.COUNT_U + "</div>";

        var divBox = $("<div class='item_flex_content' ><div class='keyWord' style='width:" + kww + "px;height:" + kww + "px;border-radius: " + kww / 2 + "px;line-height:" + kww + "px;color:#" + item.COLOR_FONT+"'>" + item.DESC_KEY + "</div><div class='CODEWS'>" + item.DESC_LINE + "</div><div class='lineName'>" + item.CODE_LINE + "</div><div class='lineStatus'>" + statusStr + "</div></div>");
        divBox.appendTo(divItem);

        //var titleHtml = "<div id='" + "title" + item.CODE_LINE + "'>";
        //$(titleHtml).appendTo(divItem);
        //var divTitle = $("#title" + item.ITEMID);
        //divTitle.css("text-align", "center").css("width", "100%").css("font-size", "28px");
        //divTitle.text(item.DES1);
        //$("<div>").appendTo(divItem).dxDataGrid(option);


        //for (var i = 0; i < data.length; i++) {
        //    var d = data[i];
        //    if (d.POS_X > maxR) {
        //        maxR = d.POS_X;
        //    }

        //    if (d.POS_Y > maxC) {
        //        maxC = d.POS_Y;
        //    }
        //}

        //for (var r = 1; r <= maxR; r++) {
        //    $('<tr>').attr('id', 'tr_' + r).attr('height', '75px').appendTo(table);
        //    var tr = $("#tr_" + r);
        //    for (var c = 1; c <= maxC; c++) {
        //        //$('<td>').attr('id', 'td_' + r + "_" + c).css('border', '1px solid').css('width', '100px').css('padding','5px 5px 5px 5px').appendTo(tr);
        //        $('<td>').attr('id', 'td_' + r + "_" + c).appendTo(tr);
        //    }
        //}

        //for (var i = 0; i < data.length; i++) {
        //    var d = data[i];
        //    var td = $("#td_" + d.POS_X + "_" + d.POS_Y);
        //    td.attr('CODE_EQP', d.CODE_EQP);
        //    td.attr('align', 'center');
        //    td.attr('valign', 'middle');
        //    td.attr('onclick', "OpenWorkShop('" + d.CODE_LINE + "','" + d.DESC_LINE + "','" + d.TYPE + "');");
            

        //    td.css('border-radius', '7px');
        //    td.css('box-shadow', '3px 3px 3px #888888');
        //    $('<div>').html(d.DISP_WS).appendTo(td);
        //    $('<div>').html(d.DISP1).css("font-size", "small").appendTo(td);
        //    $('<div>').html(d.DISP2).appendTo(td);
        //}
    }

    function OpenDevice(viewModel) {
        try {
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var searchText = $("#txtCODE_EQP").dxTextBox("instance");
            var CODE_EQP = searchText.option("value");
            var postData = {
                userName: u,
                sql: "select * from V_EMS_T_EQP where CODE_EQP='" + CODE_EQP + "'"
            };

            var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetData";
            $.ajax({
                type: 'POST',
                url: url,
                data: postData,
                cache: false,
                success: function (data, textStatus) {
                    if (data.length == 0) {
                        DevExpress.ui.notify("该设备号不存在", "error", 1000);
                        return;
                    }

                    var view = "DeviceInfo?CODE_EQP=" + CODE_EQP;
                    DMAPP.app.navigate(view);
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    viewModel.indicatorVisible(false);
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function SetLanguage() {
        if (DeviceLang() == "CHS") {
            
            if (asRoles.indexOf("MFG_EMP") != -1) {
                viewModel.title("设备列表");
            } else {
                viewModel.title("产线列表");
            }
        }
        else {
            viewModel.title("Product Line");
            $("#td1").text("Legend:");
            $("#td2").text("Equipment");
            $("#td3").text("QC");
            $("#td4").text("Transfer");
            $("#td5").text("Other");
            
        }
    }

    return viewModel;
};

function OpenWorkShop(CODE_LINE, DESC_LINE, TYPE) {
    if (TYPE == "01") {
        var view = "DeviceTable?CODE_LINE=" + CODE_LINE + "&DESC_LINE=" + DESC_LINE;
        DMAPP.app.navigate(view);
    }
    else if (TYPE == "02") {
        var view = "EQCMenu";
        DMAPP.app.navigate(view);
    }
    else if (TYPE == "03") {
        var view = "TRFEdit";
        DMAPP.app.navigate(view);
    }
    else if(TYPE=="04" ){
        var view = "M_DOC2";
        DMAPP.app.navigate(view);
    }
}

function DeivceClick(e) {
    //var CODE_EQP = e.srcElement.attributes["CODE_EQP"].value;
    var view = "DeviceInfo?CODE_EQP=" + e;
    DMAPP.app.navigate(view);
}