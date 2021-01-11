DMAPP.EMSChart = function (params) {
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
                { name: SysMsg.yl, type: "line", valueField: "YL" },
                { name: SysMsg.lp, type: "line", valueField: "LP" },
                { name: SysMsg.zz, type: "line", valueField: "ZZ" }
                //{ name: SysMsg.pzj, type: "line", valueField: "PZJ" }
            ],
            argumentAxis: {
                argumentType: "datetime",
                label: {
                    format:"MM-dd HH:mm"
                }
            },
            legend: {
                verticalAlignment: "top",
                horizontalAlignment: "center",
                itemTextPosition: "bottom"
            },
            tooltip: {
                enabled: true
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
        var ckYL = $("#ckYL").dxCheckBox("instance");
        var ckZZ = $("#ckZZ").dxCheckBox("instance");
        var ckLP = $("#ckLP").dxCheckBox("instance");
        //var ckPZJ = $("#ckPZJ").dxCheckBox("instance");

        if (ckYL.option("value") == true){
            var ser = { name: SysMsg.yl, type: "line", valueField: "YL" };
            series.push(ser);
        }

        if (ckZZ.option("value") == true) {
            var ser = { name: SysMsg.zz, type: "line", valueField: "ZZ" };
            series.push(ser);
        }

        if (ckLP.option("value") == true) {
            var ser = { name: SysMsg.lp, type: "line", valueField: "LP" };
            series.push(ser);
        }

        //if (ckPZJ.option("value") == true) {
        //    var ser = { name: SysMsg.pzj, type: "line", valueField: "PZJ" };
        //    series.push(ser);
        //}

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
            methodName: "EMS.EMS_CHART.GetPARData",
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
                }

                var charPar = $("#chartPar").dxChart("instance");
                charPar.option("dataSource", chartData);

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