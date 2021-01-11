DMAPP.Parameter = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        indicatorVisible: ko.observable(false),
        winbox: {},
        instance: {},
        codes: [],
        oldID_QP: null,
        checkFlag: false,
        emptyFlag:false,
        items: ko.observable(undefined),
        keepCache: false,
        viewShown: function (e) {
            this.viewKey = e.viewInfo.key;
            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                
            }
            SetLanguage();
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        formOption: {
            onInitialized: function (e) {
                this.instance = e.component;
            },
            colCount: 2,
            items: [
                {
                    itemType: "group",
                    colSpan: 2,
                    items: [
                        {
                            id: "ID_QP",
                            label: { text: SysMsg.ws_1 },
                            dataField: "ID_QP",
                        },
                        {
                            id: "CODE_OP",
                            label: { text: SysMsg.codeop },
                            dataField: "CODE_OP"
                        },
                        {
                            id: "ID_WO",
                            name: "ID_WO",
                            label: { text: SysMsg.woid },
                            dataField: "ID_WO",
                            tabIndex: 1
                        }
                    ],
                },
                {
                    itemType: "group",
                    name:"item_group",
                    caption: "Items",
                    cssClass:"item_group",
                    items: [],
                    colSpan: 1
                },
                {
                    itemType: "group",
                    caption: SysMsg.bzcs,
                    colSpan: 1,
                    items: [{
                        name: "op_items",
                        template: function (data, itemElement) {
                            itemElement.append("<ul id='op_item_tips'></ul>");
                        }
                    }]
                }
            ],
            onFieldDataChanged: function (e) {
                if (this.emptyFlag)
                    return;
                this.checkFlag = false;
                if (e.dataField === "ID_QP") {
                    var op = e.component.getEditor("ID_QP");//.option('value');
                    if (op && op.option('value') != this.oldID_QP) {

                        getOPdata(op.option('value'));
                        //e.component.getEditor("ID_WO").focus();
                    }
                } else if (e.dataField === "ID_WO") {
                    var op = e.component.getEditor("ID_WO");//.option('value');
                    if (op&&op.option('value')) {
                        setTextAreaValue(this.codes[0]);
                    }

                }
                else {
                    var index = this.codes.indexOf(e.dataField);
                    //校验数据是否合法
                    var option = e.component.getEditor(this.codes[index]);//.option('value');
                    if (option) {
                        var val = option.option('value');
                        var arr = this.items.filter(function (i) {
                            return i.CODE_QPAR == e.dataField
                        })[0].Items.map(function (m) {
                            return m.CODE_VALUE;
                        });
                        if (arr.length>0&&arr.indexOf(val) == -1) {
                            DevExpress.ui.notify("请输入有效的值", "error", 1000);
                            this.checkFlag = true;
                            e.component.getEditor(e.dataField).focus();
                        }
                    }
                }
            },
            onEditorEnterKey: function (e) {
                if (e.dataField === "ID_QP") {
                    e.component.getEditor("ID_WO").focus();
                    //var op = $("#formMain").dxForm("instance").getEditor("ID_QP").option('value');
                    //debugger;
                    //console.log("b;" + op + ";" + this.oldID_QP);
                    //if (op && op != this.oldID_QP) {
                    //    console.log("c");
                    //    getOPdata(op);
                    //    e.component.getEditor("ID_WO").focus();
                    //}
                }
                else if (e.dataField === "ID_WO") {
                    if (!!window.ActiveXObject || "ActiveXObject" in window) {
                        e.component.getEditor(this.codes[0]).focus();
                        setTextAreaValue(this.codes[0]);
                    }
                    else {
                        var wo = e.component.getEditor("ID_WO").option('value');
                        if (wo) {
                            e.component.getEditor(this.codes[0]).focus();
                            setTextAreaValue(this.codes[0]);
                        }
                    }                    
                }
                else {
                    if (this.checkFlag)
                        return;
                    var index = this.codes.indexOf(e.dataField);
                    ////校验数据是否合法
                    //var val = e.component.getEditor(this.codes[index]).option('value');
                    //var arr = this.items.filter(function (i) {
                    //    return i.CODE_QPAR == e.dataField
                    //})[0].Items.map(function (m) {
                    //    return m.CODE_VALUE;
                    //});
                    //console.log(val);
                    //console.log(arr);
                    //if (arr.indexOf(val) == -1) {
                    //    DevExpress.ui.notify("请输入有效的值", "error", 1000);
                    //} else {
                        
                    //}
                    if (index < this.codes.length - 1) {
                        e.component.getEditor(this.codes[index + 1]).focus();
                        setTextAreaValue(this.codes[index + 1]);
                    }
                    else {
                        $("#subButton").dxButton("instance").focus()
                    }
                }
                
               
            }
        },
        subBtnOption: {
            text: SysMsg.submit,
            type: "success",
            height: "60px",
            width: "120px",
            elementAttr: {
                class:"parameter_sub_btn"
            },
            onClick: SaveData
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "BTNSUBMIT" }
            ],
            direction: 'vertical',
            height: "100%",
            baseItemWidth: (window.screen.width / 6) - 10,
            baseItemHeight: (window.screen.width / 6) - 10,
            width: window.screen.width / 6,
            itemMargin: 5,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.DES +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.DES + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                SaveData();
            },
        },
    };
    function setTextAreaValue(CODE_QPAR) {
        for (var i = 0; i < viewModel.items.length; i++) {
            if (CODE_QPAR == viewModel.items[i].CODE_QPAR) {
                var str = viewModel.items[i].Items.map(function(x){
                    return "<li>"+x.CODE_VALUE + "-" + x.DESC_VALUE+"</li>";
                })
                $("#op_item_tips").empty();
                $("#op_item_tips").append(str);
            }
        }
    }

    function SetLanguage() {
        var tile;
        var form = $("#formMain").dxForm("instance");
        if (DeviceLang() == "CHS") {
            tile = "质检参数录入";
        }
        else {
            tile = params.CODE_EQP + "QC Parameter";
            //form.itemOption("CODE_BAR", "label", { text: "Barcode" });
            //form.itemOption("CODE_ICATE", "label", { text: "Spec." });
            //form.itemOption("CODE_CLASS", "label", { text: "Material" });
            //form.itemOption("CODE_ITEM", "label", { text: "Item Code" });
            //form.itemOption("CODE_LOT", "label", { text: "Lot No." });
        }

        viewModel.title(tile);
    }
    function getOPdata(op) {
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "EMS.Common.GetOPData",
            param: op
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                var json = JSON.parse(data.Message.replace(/\'/g, '\"'));
                if (json.Success) {
                    console.log(json);
                    viewModel.codes = [];
                    var items = [];
                    for (var i = 0; i < json.Ops.length; i++) {
                        var o = json.Ops[i];
                        viewModel.codes.push(o.CODE_QPAR);
                        items.push({
                            label: { text: o.PARAMETER },                            
                            dataField: o.CODE_QPAR,
                        });
                    }
                    
                    viewModel.items = json.Ops;
                    
                    $("#formMain").dxForm("instance").itemOption("item_group", "items", items);
                    
                    $("#formMain").dxForm("instance").repaint();
                    viewModel.instance.option("formData.CODE_OP",json.CODE_OP);
                    viewModel.instance.getEditor("ID_WO").focus(); 
                }
                else {
                    DevExpress.ui.notify(json.ErrorMsg, "error", 1000);
                }
                
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    function SaveData() {
        var u = sessionStorage.getItem("username");
        var obj = $("#formMain").dxForm("instance").option("formData");
        var id_op = obj.ID_QP ? obj.ID_QP : '';
        var code_op = obj.CODE_OP ? obj.CODE_OP : '';
        var id_wo = obj.ID_WO ? obj.ID_WO : '';
        var items = [];
        for (var prop in obj) {
            if (['ID_QP', 'CODE_OP', 'ID_WO'].indexOf(prop) == -1&&obj[prop]) {
                items.push({
                    CODE_QPAR: prop,
                    RESULT_QC: obj[prop]
                });
            }
        }

        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/CallMethod";
        var postData = {
            userName: u,
            methodName: "MFG.MFG_OPQC2.MFG_Save",
            param: id_op + "`" + code_op + "`" + id_wo,
            data: items
        }

        $.ajax({
            type: 'POST',
            data: postData,
            url: url,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                viewModel.emptyFlag = true;
                var op = $("#formMain").dxForm("instance").getEditor("ID_QP").option("value");
                var code = $("#formMain").dxForm("instance").getEditor("CODE_OP").option("value");
                $("#formMain").dxForm("instance").option("formData", { ID_QP: op, CODE_OP: code });
                $("#formMain").dxForm("instance").getEditor("ID_QP").focus();
                viewModel.emptyFlag = false;
                DevExpress.ui.notify(SysMsg.subSuccess, "success", 1000);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }
    return viewModel;

};