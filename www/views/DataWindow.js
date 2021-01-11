﻿DMAPP.DataWindow = function (params) {
    var viewModel = {
        title: ko.observable(""),
        searchInited: false,
        winbox:{},
        viewShown: function () {
            BindData("");
        },
        viewHidden: function (e) {
            var cache = DMAPP.app.viewCache;
            cache.removeView(e.viewInfo.key);

        },
        toolBarOption:{
            items: [
               { location: 'before', widget: 'button', name: 'find', options: { icon: 'find', text: '精确查找' } },
               {
                   widget: 'dxTextBox',
                   options: {
                       search: 'search',
                       placeholder: SysMsg.fuzzysearch,
                       width: "300px",
                       onValueChanged: function (e) {
                           BindData("@FUZZY."+e.value);
                       },

                   },
                   
                   location: 'before'
               }
            ],
            onItemClick: function (e) {
                switch (e.itemData.name){
                    case "find":
                        {
                            var popup = $("#popDWSearch").dxPopup("instance");
                            popup.show();
                            break;
                        }
                }
            }
        },
        gridDataWindowOptions: {
            columnAutoWidth: true,
            paging: {
                enabled: false
            },
            selection: {
                mode: "single"
            },
            onSelectionChanged: function (selectedItems) {
                var selection = selectedItems.selectedRowsData[0];
                if (selection == null)
                {
                    return;
                }

                ProcessSelection(selection);
                return;
            }
        },
        searchPopupOption: {
            title: '',
            showTitle: true,
            visible: false,
            toolbarItems:
               [{
                   location: 'center', options: {
                       text: '执行查找',
                       icon: 'find',
                       onClick: function (e) {
                           SearchData(viewModel);
                       }
                   }, widget: 'dxButton'
               }],
            onShowing: function (e) {
                if (viewModel.searchInited == true) {
                    return;
                }
                var $fsSearch = $("#fsDWSearch");
                for (var i = 0; i < this.winbox.field.length; i++) {
                    var field = this.winbox.field[i];
                    AddSearchField(field, $fsSearch);
                }
                viewModel.searchInited=true;

            },
            onShown: function (e) {
                var w = $("#popDWSearch").width();
                w = w - w / 3.15;
                $("#fsDWSearch").width(w);
                $("#popDWSearch").dxPopup("instance").repaint();
            }
        }
    };

    function AddSearchField(field, $fsSearch) {
        $('<div>').attr('id', 'fsfdw' + field.FIELDNAME).attr("class", "dx-field").appendTo($fsSearch);
        var $field = $("#fsfdw" + field.FIELDNAME);
        $('<div>').attr("class", "dx-field-label").appendTo($field).html(field.DES);
        $('<div>').attr('id', 'fsvdw' + field.FIELDNAME).attr("class", "dx-field-value").appendTo($field);
        var $fv = $("#fsvdw" + field.FIELDNAME);

        var editorOption = {
            value: "",
            readOnly: false,
            BLOCKID: "",
            FIELDNAME: field.FIELDNAME
        }
        var feID = "fedw" + field.FIELDNAME;

        createMainControl(feID, $fv, field, editorOption);

        if (field.CTRLTYPE == "4") {
            $('<div>').attr('id', 'fedw' + field.FIELDNAME + '_T').appendTo($fv).dxDateBox({
                value: "",
                formatString: "yyyy-MM-dd",
                pickerType: "calendar",
                readOnly: false
            });
        }
    }

    function BindData(filter) {
        try {
            
            var sessionStorage = window.sessionStorage;
            var u = sessionStorage.getItem("username");
            var p = JSON.parse(sessionStorage.getItem("dwParam"));
            var postData;
            var url;

            if (p.blockID == null) {
                url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetDataWindowSimple";
                postData = {
                    userName: u,
                    tableName: p.tableName,
                    fields: p.fields,
                    title: p.title,
                    filterString: p.filterString
                }
            }
            else {
                url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetDataWindow";
                postData = {
                    userName: u,
                    rowIndex: p.rowIndex,
                    blockID: p.blockID,
                    fieldName: p.fieldName,
                    filterString: filter
                }
            }

            $.ajax({
                type: 'POST',
                url: url,
                data:postData,
                cache: false,
                success: function (data, textStatus) {
                    var textSelect = DeviceLang() == "CHS" ? "选择" : "Pick ";
                    viewModel.title(textSelect + data.title);
                    viewModel.winbox = data;
                    var dataGrid = $('#gridDataWindow').dxDataGrid('instance');
                    var cols = [];

                    for (var i = 0; i<data.field.length; i++)
                    {
                        var field = data.field[i];
                        var col = createListControl(field, true, null);
                        cols.push(col);
                    }

                    $("#gridDataWindow").dxDataGrid({
                        columns: cols,
                        columnAutoWidth: true,
                        dataSource: data.data
                    });
                    
                    dataGrid.refresh();
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    ServerError(xmlHttpRequest.responseText);
                }
            });
        }
        catch (e) {
            DevExpress.ui.notify(e.message, "error", 1000);
        }
    };

    function ProcessSelection(selection)
    {
        var sessionStorage = window.sessionStorage;
        sessionStorage.setItem("viewAction", "dataWindow");
        sessionStorage.setItem("dwData", JSON.stringify(selection));
        (new DevExpress.framework.dxCommand({ onExecute: "#_back" })).execute();
    }

    function SearchData(viewModel) {
        var where = "1=1";

        for (var i = 0; i < viewModel.winbox.field.length; i++) {
            var field = viewModel.winbox.field[i];
            var control;
            var feID = "#fedw" + field.FIELDNAME;

            switch (field.CTRLTYPE) {
                case "2": {
                    if (field.DS_DATA.length > 0) {
                        control = $(feID).dxSelectBox("instance");
                    }
                    else {
                        control = $(feID).dxTextBox("instance");
                    }

                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        where = where + " and " + field.FIELDNAME + "='" + val + "'";
                    }
                    break;
                }
                case "3": {
                    control = $(feID).dxCheckBox("instance");
                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        val = (val == true ? "1" : "0");
                        where = where + " and " + field.FIELDNAME + "=" + val;
                    }
                    break;
                }
                case "4": {
                    var control1 = $(feID).dxDateBox("instance");
                    var val1 = control1.option().text;
                    var control2 = $(feID + "_T").dxDateBox("instance");
                    var val2 = control2.option().text;
                    if (val1 != null && val1.toString() != "") {
                        if (val2 != null && val2.toString() != "") {
                            where = where + " and (" + field.FIELDNAME + " between '" + val1 + "' and '" + val2 + "')";
                        }
                        else {
                            where = where + " and " + field.FIELDNAME + "='" + val1 + "'";
                        }
                    }
                    break;
                }
                case "5": {
                    control = $(feID).dxTextArea("instance");
                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        where = where + " and " + field.FIELDNAME + " like '%" + val + "%'";
                    }
                    break;
                }
                case "7": {
                    control = $(feID).dxNumberBox("instance");
                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        where = where + " and " + field.FIELDNAME + "=" + val;
                    }
                    break;
                }
                case "8": {
                    control = $(feID).dxTextBox("instance");
                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        where = where + " and " + field.FIELDNAME + "='" + val + "'";
                    }
                    break;
                }
                default: {
                    control = $(feID).dxTextBox("instance");
                    var val = control.option().value;
                    if (val != null && val.toString() != "") {
                        where = where + " and " + field.FIELDNAME + " like '%" + val + "%'";
                    }
                    break;
                }
            }
        }

        var popup = $("#popDWSearch").dxPopup("instance");
        popup.hide();
        BindData(where);
    }

    return viewModel;
};