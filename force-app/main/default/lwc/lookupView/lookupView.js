import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class LookupView extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName;

    recordPageUrl;

    get fields() {
        return [`${this.objectApiName}.Name`];
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$fields' })
    object;

    get name() {
        return this.object.data ? this.object.data.fields.Name.value : '';
    }

    connectedCallback() {
        // Generate a URL to the record page
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view',
            },
        }).then(url => {
            this.recordPageUrl = url;
        });
    }
}