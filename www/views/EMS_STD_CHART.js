DMAPP.EMS_STD_CHART = function (params) {
    "use strict";
    var viewModel = {
        title: ko.observable(""),
        viewShown: function (e) {
            SetLanguage();
            this.viewKey = e.viewInfo.key;
            InitData();
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        buttonLoadClick: function (e) {
            GetData();
        },
        SvOption: { height: $(window).height() - 105, width: '100%', direction: 'vertical' }
    };

    function SetLanguage() {
        var title;
        if (DeviceLang() == "CHS") {
            title = params.CODE_EQP + "曲线图";
        }
        else {
            title = params.CODE_EQP + " Chart";
            $("#td1").text("Date");
            $("#td2").text("To");
        }
        viewModel.title(title);
    }

    function InitData() {
        var now = new Date();
        var nowSTR = now.Format("yyyy-MM-ddTHH:mm:ss");
        var nowM8 = now;
        nowM8.setTime(nowM8.getTime() - 60 * 60 * 1000 * 24);
        var nowSTRM8 = nowM8.Format("yyyy-MM-ddTHH:mm:ss");

        var dateFrom = $("#dateFrom").dxDateBox("instance");
        var dateTo = $("#dateTo").dxDateBox("instance");
        dateFrom.option("value", nowSTRM8);
        dateTo.option("value", nowSTR);
        BindData();
    }

    function BindData() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";

        $.ajax({
            type: 'POST',
            data: {
                userName: u,
                methodName: "EMS.EMS_CHART.GetListDetail",
                param: params.CODE_EQP
            },
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var details = $("#listDetail").dxTagBox("instance");
                details.option("dataSource", data);
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

    function GetData() {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var dateFrom = $("#dateFrom").dxDateBox("instance");
        var dateTo = $("#dateTo").dxDateBox("instance");
        var selected = $("#listDetail").dxTagBox("instance").option("selectedItems").map(function (x) { return x.ID_QP; });

        var dFrom = dateFrom.option("value");
        var dTo = dateTo.option("value");
        var offset = new Date().getTimezoneOffset();
        var postData = {
            userName: u,
            methodName: "EMS.EMS_CHART.Get_STD_Data",
            param: selected.join(',')+";"+ params.CODE_EQP + ";" + dFrom + ";" + dTo + ";" + offset
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                $("#charts").empty();
                var arr = data.map(function (t) {
                    return t.TYPE_OP;
                })
                arr = Array.from(new Set(arr));
                console.log(arr);
                arr.forEach(function (val) {
                    var list = data.filter(function (x) { return x.TYPE_OP == val; }).map(function (d) {
                        d.VALUE = Number(d.VALUE);
                        d.MAX = d.MAX == null ? null : Number(d.MAX);
                        d.MIN = d.MIN == null ? null :Number(d.MIN);
                        return d;
                        
                    });
                    if (list.length > 0) {
                        var el = document.createElement("DIV");
                        document.getElementById("charts").appendChild(el);
                        var chartOption = {
                            commonSeriesSettings: {
                                argumentField: "CREDAT",
                                type: "line"
                            },
                            title: {
                                horizontalAlignment:'left',
                                text: list[0].DESC_PAR,
                                font: {
                                    size:14
                                }
                            },
                            series: [
                                {
                                    name: SysMsg.scz, type: "line", valueField: "VALUE" ,label: {
                                        visible: true,
                                        position: 'inside'
                                    }
                                },
                                {
                                    name: SysMsg.min, type: "line", valueField: "MIN", label: {
                                        visible: true,
                                        position: 'inside'
                                    }
                                },
                                {
                                    name: SysMsg.max, type: "line", valueField: "MAX", label: {
                                        visible: true,
                                        position: 'inside'
                                    }
                                },
                            ],
                            argumentAxis: {
                                argumentType: "datetime",
                                label: {
                                    format: "MM-dd HH:mm"
                                }
                            },
                            legend: {
                                verticalAlignment: "top",
                                horizontalAlignment: "center",
                                itemTextPosition: "bottom"
                            },
                            tooltip: {
                                enabled: true
                            },
                            dataSource: list
                        };
                        $(el).addClass("chart_div");
                        $(el).dxChart(chartOption);
                    }
                })
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

    return viewModel;
};