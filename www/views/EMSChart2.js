DMAPP.EMSChart2 = function (params) {
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
        chartOption: {
            commonSeriesSettings: {
                argumentField: "PAR_TIME",
                type: "line"
            },
            series: [
                {
                    name: SysMsg.cc, type: "line", valueField: "SIZE", point: {
                        size: 7
                    }, label: { visible: true, backgroundColor: "transparent", font: { color: "black" } }, ignoreEmptyPoints: true
                },
                {
                    name: SysMsg.mbcc, type: "line", valueField: "SIZE_S", point: {
                        visible: false,ignoreEmptyPoints: true
                    }
                },
                {
                    name: SysMsg.sl, type: "scatter", valueField: "T11", point: {
                        symbol: "triangleUp"
                    }
                },
                {
                    name: SysMsg.xl, type: "scatter", valueField: "T12", point: {
                        symbol: "triangleDown"
                    }
                },
                { name: SysMsg.fltj, type: "scatter", valueField: "T13", point: { image: { url: "images/AA.png", width: 16, height: 16 } } },
                { name: SysMsg.flgh, type: "scatter", valueField: "T14", point: { image: { url: "images/CC.png", width: 16, height: 16 } } },
                {
                    name: SysMsg.round, type: "scatter", valueField: "TROUND", point: {
                        symbol: "circle"
                    }
                },
                {
                    name: SysMsg.pzj, type: "scatter", valueField: "TPZJ", point: {
                        symbol: "square"
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
                enabled: true,
                argumentFormat:"MM-dd HH:mm",
                customizeTooltip: function (e) {
                    if (e.seriesName == SysMsg.sl || e.seriesName == SysMsg.xl || e.seriesName == SysMsg.fltj || e.seriesName == SysMsg.flgh) {
                        return { text: e.seriesName + "<br/>" + e.argumentText }
                    }
                    else {
                        return { text: e.value+ "<br/>" + e.argumentText  }
                    }
                }
            }
        },
        buttonLoadClick: function (e) {
            BindData();
        },
        checkChanged: function (e) {
            SetChartSeries();
        }
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

    function SetChartSeries() {
        var series = [];
        var ckSIZE = $("#ckSIZE").dxCheckBox("instance");
        var ckSXL = $("#ckSXL").dxCheckBox("instance");

        if (ckSIZE.option("value") == true) {
            var ser = {
                name: SysMsg.cc, type: "line", valueField: "SIZE", point: {
                    size: 7
                }, label: { visible: true, backgroundColor: "transparent", font: {color:"black"}  }, ignoreEmptyPoints:true
            };
            var ser2 = {
                name: SysMsg.mbcc, type: "line", valueField: "SIZE_S", point: {
                    visible: false
                }, ignoreEmptyPoints: true
            };
            series.push(ser);
            series.push(ser2);
        }

        if (ckSXL.option("value") == true) {
            var ser = {
                name: SysMsg.sl, type: "scatter", valueField: "T11", point: {
                    symbol: "triangleUp"
                }
            };
            var ser2 = {
                name: SysMsg.xl, type: "scatter", valueField: "T12", point: {
                    symbol: "triangleDown"
                }
            };
            var ser3 = { name: SysMsg.fltj, type: "scatter", valueField: "T13", point: { image: { url: "images/AA.png", width: 16, height: 16 } } };
            var ser4 = { name: SysMsg.flgh, type: "scatter", valueField: "T14", point: { image: { url: "images/CC.png", width: 16, height: 16 } } };
            series.push(ser);
            series.push(ser2);
            series.push(ser3);
            series.push(ser4);
        }

        var charPar = $("#chartPar").dxChart("instance");
        charPar.option("series", series);
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
        var dateFrom = $("#dateFrom").dxDateBox("instance");
        var dateTo = $("#dateTo").dxDateBox("instance");

        var dFrom = dateFrom.option("value");
        var dTo = dateTo.option("value");
        var offset = new Date().getTimezoneOffset();
        var postData = {
            userName: u,
            methodName: "EMS.EMS_CHART.GetPARData2",
            param: params.CODE_EQP + ";" + dFrom + ";" + dTo + ";" + offset
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var chartData = [];
                for (var i = 0; i < data.length; i++) {
                    chartData.push(data[i]);
                    //var item = {};
                    //for (var key in data[i]) {
                    //    if (data[i][key] != null) {
                    //        item[key] = data[i][key];
                    //    }
                    //}
                   
                    //chartData.push(item);
                }

                var charPar = $("#chartPar").dxChart("instance");
                charPar.option("dataSource", chartData);

            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
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