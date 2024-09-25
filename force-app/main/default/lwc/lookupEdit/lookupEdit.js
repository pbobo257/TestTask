import { LightningElement, api } from 'lwc';

export default class LookupEdit extends LightningElement {
    @api value;
    @api objectApiName;
    @api required;
    @api filter;

    handleChange(event) {
        try {
            event.stopPropagation();

            this.value = event.detail.recordId;

            this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true,
                detail: {
                    value: this.value,
                },
            }));
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
        }
    }

    handleBlur(event) {
        try {
            event.stopPropagation();

            this.dispatchEvent(new CustomEvent('blur', {
                bubbles: true
            }));
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
        }
    }

    @api
    get validity() {
        return {
            valid: this.template.querySelector('lightning-record-picker').checkValidity()
        };
    }

    @api
    showHelpMessageIfInvalid() {
        return this.template.querySelector('lightning-record-picker').reportValidity();
    }

    @api
    focus() {
        this.template.querySelector('lightning-record-picker').focus();
    }
}