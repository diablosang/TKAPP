DMAPP.DeviceTable = function (params) {
    "use strict";

    var viewModel = {
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        fieldList:[],
        listFieldsOption:{
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
        viewShown: function () {
            this.title(params.DESC_LINE);

            BindData();
        },
        onLogoffClick: function (e) {
            Logoff();
        },
        onFieldSelectClick:function(e){
            var pop = $("#popSelect").dxPopup("instance");
            pop.show();
        },
        onSelectOKClick: function (e) {
           
        }
    };

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
        BindTable();
    }

    function BindData()
    {
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

            BindTable();
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
        
    }

    function BindTable(){
        var sessionStorage = window.sessionStorage;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";

        var postData = {
            userName: u,
            methodName: "EMS.Common.GetDeviceTable",
            param: params.CODE_LINE
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            cache: false,
            success: function (data, textStatus) {
                var r = 0;
                var c = 0;
                var maxR = 0;
                var maxC = 0;
                var table = $("#tbDevice");
                table.empty();

                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if (d.POS_X > maxR) {
                        maxR = d.POS_X;
                    }

                    if (d.POS_Y > maxC) {
                        maxC = d.POS_Y;
                    }
                }

                for (var r = 1; r <= maxR; r++) {
                    $('<tr>').attr('id', 'tr_' + r).attr('height', '75px').appendTo(table);
                    var tr = $("#tr_" + r);
                    for (var c = 1; c <= maxC; c++) {
                        //$('<td>').attr('id', 'td_' + r + "_" + c).css('border', '1px solid').css('width', '100px').css('padding','5px 5px 5px 5px').appendTo(tr);
                        $('<td>').attr('id', 'td_' + r + "_" + c).appendTo(tr);
                    }
                }

                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    var td = $("#td_" + d.POS_X + "_" + d.POS_Y);
                    td.attr('CODE_EQP', d.CODE_EQP);
                    td.attr('align', 'center');
                    td.attr('valign', 'middle');
                    td.attr('onclick', "DeivceClick('" + d.CODE_EQP + "');");
                    var color = "#F5F5F5";
                    if (d.COLOR != null && d.COLOR != "") {
                        color = "#" + d.COLOR;
                    }
                    td.css("background-color", color);
                    td.css('border-radius', '7px');
                    td.css('box-shadow', '3px 3px 3px #888888');

                    $('<div>').html(d.CODE_EQP).appendTo(td);

                    var localStorage = window.localStorage;
                    var selectedFields = localStorage.getItem("selectedFields");
                    if (selectedFields != null) {
                        var fields = JSON.parse(selectedFields);
                        for (var s = 0; s < fields.length; s++) {
                            $('<div>').html(d[fields[s]]).css("font-size", "small").appendTo(td);
                        }
                    }

                    //$('<div>').html(d.DESC_DISP1).css("font-size", "small").appendTo(td);
                    //$('<div>').html(d.DESC_DISP2).appendTo(td);
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};

function DeivceClick(e) {
    //var CODE_EQP = e.srcElement.attributes["CODE_EQP"].value;
    var view = "DeviceInfo?CODE_EQP=" + e;
    DMAPP.app.navigate(view);
}