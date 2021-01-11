DMAPP.EMS_T_AMD = function (params) {
    "use strict";

    var viewModel = {
        viewKey: "",
        title: ko.observable(""),
        clickTrigger: true,
        attachType:"image",
        indicatorVisible: ko.observable(false),
        winbox: {},
        keepCache: false,
        viewShown: function (e) {
            SetLanguage();

            this.viewKey = e.viewInfo.key;
            if (viewModel.keepCache == true) {
                viewModel.keepCache = false;
                var viewAction = sessionStorage.getItem("viewAction");
                if (viewAction != null) {
                    sessionStorage.removeItem("viewAction");
                    if (viewAction == "refreshRow") {
                        RefreshData(this);
                    }

                    if (viewAction == "dataWindow") {
                        var param = JSON.parse(sessionStorage.getItem("dwParam"));
                        if (param.blockID == "BMAINBLOCK") {
                            UpdateDataWindow(this);
                        }
                        else {
                            UpdateGridDataWindow(this, "gridDetail");
                        }
                    }
                }
                return;
            }

            try {
                GetWinbox();
            }
            catch (e) {
                DevExpress.ui.notify("该单据未包含明细信息", "error", 1000);
            }
        },
        viewHidden: function (e) {
            if (viewModel.keepCache == false) {
                var cache = DMAPP.app.viewCache;
                cache.removeView(e.viewInfo.key);
            }
        },
        formOption: {
            colCount:1,
            items: [
                {
                    id: "CODE_AMITEM",
                    label: { text: SysMsg.amd_codeitem },
                    dataField: "CODE_AMITEM",
                    colSpan: 1,
                    editorOptions: {
                        readOnly:true
                    }
                },
                //{
                //    id: "DESC_AMITEM",
                //    label: { text: SysMsg.amd_descitem },
                //    dataField: "DESC_AMITEM",
                //    colSpan: 1,
                //    editorOptions: {
                //        readOnly: true
                //    }
                //},
                //{
                //    id: "TYPE_AMITEM",
                //    label: { text: SysMsg.amd_type },
                //    dataField: "TYPE_AMITEM",
                //    editorType: "dxLookup",
                //    editorOptions: {
                //        readOnly: true,
                //        displayExpr: DESField(),
                //        valueExpr: "IDLINE",
                //        dataSource: asListData.TP_EMS_B_AMITEM
                //    }
                //},
                //{
                //    id: "CONFIG",
                //    label: { text: SysMsg.amd_config },
                //    dataField: "CONFIG",
                //    editorType: "dxLookup",
                //    editorOptions: {
                //        readOnly: true,
                //        displayExpr: DESField(),
                //        valueExpr: "IDLINE",
                //        dataSource: asListData.TP_EMS_B_AMITEM
                //    }
                //},
                //{
                //    id: "METHOD",
                //    label: { text: SysMsg.amd_method },
                //    dataField: "METHOD",
                //    editorType: "dxLookup",
                //    editorOptions: {
                //        readOnly: true,
                //        displayExpr: DESField(),
                //        valueExpr: "IDLINE",
                //        dataSource: asListData.TP_EMS_B_AMITEM
                //    }
                //},
                //{
                //    id: "DESC_METHOD",
                //    label: { text: SysMsg.amd_methoddesc },
                //    dataField: "DESC_METHOD",
                //    colSpan: 1,
                //    editorOptions: {
                //        readOnly: true
                //    }
                //},
                {
                    id: "VALUE",
                    label: { text: SysMsg.amd_value },
                    dataField: "VALUE",
                    colSpan: 1,
                    editorOptions: {
                        readOnly: false
                    }
                },
                {
                    id: "F_IMAGE",
                    label: { text: SysMsg.amd_f_image },
                    dataField: "F_IMAGE",
                    colSpan: 1,
                    editorType:"dxCheckBox",
                    editorOptions: {
                        readOnly: true
                    }
                },
            ],
            onFieldDataChanged: function (e) {
                if (this.keepCache == true) {
                    MainValueChanged(viewModel, e);
                }
            }
        },
        tileBarOption: {
            items: [
                { DES: SysMsg.submit, name: "A91" }
            ],
            direction: 'vertical',
            height: "100%",
            baseItemHeight: 192,
            baseItemWidth: 192,
            itemMargin: 10,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.DES +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/SUBMIT.jpg')\"></div>");
            },
            onItemClick: function (e) {
                BarItemClick(e);
            },
        },
        btnUploadOption: {
            icon: "images/upload.png",
            block:"BMAINBLOCK",
            field: "IMAGE",
            onClick: function (e) {
                ImageUpload(e);
            }
        },
        btnCameraOption: {
            icon: "images/camera.png",
            block: "BMAINBLOCK",
            field: "IMAGE",
            onClick: function (e) {
                ImageCamera(e);
            }
        }
    };

    function SetLanguage() {

    }


    function GetWinbox() {
        viewModel.indicatorVisible(true);
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value + "/Api/Asapment/GetWinboxDataSimple";
        var postData = {
            userName: u,
            func: "EMS_T_AMD",
            group: "GTPRO",
            doc: params.SID
        };

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
                        BindImage(data[i].data[0].IMAGE);
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
    }

    function BarItemClick(e) {
        if (e.itemData.needComment == "1") {
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

            ButtonClick(viewModel, "BMAINBLOCK", e.itemData.name, "", params);
        }
    }

    function BindImage(imgData) {
        var img = $("#imgAMD")[0];
        img.src = "data:image;base64," + imgData;

        $("#fileSelector").off("change");
        $("#fileSelector").on("change", function (e) {
            if (viewModel.clickTrigger == false) {
                return;
            }
            else {
                viewModel.clickTrigger = false;
            }
            var inputObj = this;
            if (inputObj.files.length == 0) {
                ServerError("No file selected");
                return;
            }
            var file = inputObj.files[0];

            if (viewModel.attachType == "image") {
                if (!/image\/\w+/.test(file.type)) {
                    ServerError("Not an image file selected");
                    return;
                }
            }

            viewModel.indicatorVisible(true);

            var reader = new FileReader();
            reader.onload = function (e) {
                var postData = {
                    name: file.name,
                    value: this.result,
                    block: "BMAINBLOCK",
                    field: viewModel.attachField
                }

                if (viewModel.attachType == "image") {
                    PostImage(postData);
                }
                else {
                    PostFile(postData);
                }
                inputObj.value = "";
            }
            reader.readAsDataURL(inputObj.files[0]);
        });
    }

    function ImageUpload(e) {
        viewModel.clickTrigger = true;
        e.event.stopPropagation();
        var button = e.element.dxButton("instance");
        viewModel.attachType = "image";
        viewModel.attachField = button.option("field");
        var inputObj = $("#fileSelector")[0];
        inputObj.click();
    }

    function ImageCamera(e) {
        if (viewModel.clickTrigger == false) {
            viewModel.clickTrigger = true;
            return;
        }
        else {
            viewModel.clickTrigger = false;
        }

        var button = e.element.dxButton("instance");
        var option = button.option();

        navigator.camera.getPicture(
            function (e) {
                var val = "data:image;base64," + e;
                var postData = {
                    value: val,
                    block: option.block,
                    field: option.field
                }
                PostImage(postData);
            },
            function (e) {
                ServerError(e);
            },
            { destinationType: Camera.DestinationType.DATA_URL }
        );
    }

    function PostImage(e) {
        if (viewModel.fieldEvent == false) {
            return;
        }
        var val = e.value;
        var u = sessionStorage.getItem("username");
        var url = $("#WebApiServerURL")[0].value  + "/Api/Asapment/PostImage";

        var postData = {
            userName: u,
            blockID: "BMAINBLOCK",
            fieldName: "IMAGE",
            base64Value: val,
            rowIndex: 0
        }

        var img = $("#imgAMD")[0];

        $.ajax({
            type: 'POST',
            url: url,
            data: postData,
            async: false,
            cache: false,
            success: function (data, textStatus) {
                img.src = val;
                viewModel.indicatorVisible(false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                viewModel.indicatorVisible(false);
                ServerError(xmlHttpRequest.responseText);
            }
        });
    }

    return viewModel;
};