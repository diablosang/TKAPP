DMAPP.EQCMenu = function (params) {
    "use strict";

    var viewModel = {
        tileBarOption: {
            direction: 'vertical',
            height: "100%",
            baseItemHeight: 192,
            baseItemWidth: 192,
            itemMargin: 10,
            itemTemplate: function (itemData, itemIndex, itemElement) {
                var url = $("#WebApiServerURL")[0].value;
                itemElement.append("<div class=\"ItemDesc\">" + itemData.text +
                    "</div><div class=\"BKImage\" style=\"background-image: url('" + url + "/images/JGBR/" + itemData.text + ".jpg')\"></div>");
            },
            onItemClick: function (e) {
                if (e.itemData.name == 'PAR') {
                    DMAPP.app.navigate("Parameter");
                } else {
                    var view = "EQCEdit?TYPE=" + e.itemData.name;
                    DMAPP.app.navigate(view);
                }
                
            }
        },
        viewShown: function (e) {
            BindItem();
        }
    };


    function BindItem() {
        var itm = [];
        for (var i = 0; i < workShopBarAuth.length; i++) {
            if (DeviceLang() == "CHS") {

                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_OK") >= 0) {
                    itm.push({ name: 'OK', text: '合格' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_CG") >= 0) {
                    itm.push({ name: 'CG', text: '改制' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_RT") >= 0) {
                    itm.push({ name: 'RT', text: '返工' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_SC") >= 0) {
                    itm.push({ name: 'SC', text: '报废' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_PAR") >= 0) {
                    itm.push({ name: 'PAR', text: '质检录入' });
                    continue;
                }
                
            }
            else {
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_OK") >= 0) {
                    itm.push({ name: 'OK', text: 'OK' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_CG") >= 0) {
                    itm.push({ name: 'CG', text: 'Change' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_RT") >= 0) {
                    itm.push({ name: 'RT', text: 'Return' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_SC") >= 0) {
                    itm.push({ name: 'SC', text: 'Scrap' });
                    continue;
                }
                if (workShopBarAuth[i].CODE_MENU.indexOf("WS_1_PAR") >= 0) {
                    itm.push({ name: 'PAR', text: '质检录入' });
                    continue;
                }
            }
        }



        var tileBar = $("#tileBar").dxTileView("instance");
        tileBar.option("dataSource", itm);
    }

    return viewModel;
};