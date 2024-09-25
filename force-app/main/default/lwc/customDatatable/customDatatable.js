import LightningDatatable from "lightning/datatable";
import lookupTemplate from "./lookup.html";
import lookupEditTemplate from "./lookupEdit.html";

export default class CustomDatatable extends LightningDatatable {
    static customTypes = {
        lookup: {
            template: lookupTemplate,
            editTemplate: lookupEditTemplate,
            standardCellLayout: true,
            typeAttributes: ["objectApiName"],
        }
    };
}