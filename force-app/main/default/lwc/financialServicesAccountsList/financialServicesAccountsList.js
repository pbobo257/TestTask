import { LightningElement, wire } from 'lwc';

import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getAccounts from '@salesforce/apex/FinancialServicesAccountsListController.getAccounts';

export default class FinancialServicesAccountsList extends LightningElement {
    data;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    draftValues = [];
    accountName = '';
    isFirstRender = true;

    wiredResult;
    @wire(getAccounts, { name: '$accountName' })
    wiredAccounts(result) {
        try {
            this.wiredResult = result;
            if (result.data) {
                const data = this.sortedBy && this.sortDirection
                    ? this.sortData(result.data, this.sortedBy, this.sortDirection)
                    : result.data
                this.data = data.map(record => {
                    return {
                        ...record,
                        cellClass: record.UserRecordAccess.HasEditAccess ? '' : 'non-editable'
                    }
                })

                console.log(JSON.stringify(this.data));
            } else if (result.error) {
                this.showErrorToast(result.error);
            }
        } catch (e) {
            this.showErrorToast(e);
        }
    }

    get columns() {
        return [
            {
                label: 'Account Name',
                fieldName: 'Id',
                sortable: true,
                displayReadOnlyIcon: true,
                type: 'lookup',
                typeAttributes: {
                    objectApiName: 'Account'
                }
            },
            {
                label: 'Account Owner',
                fieldName: 'OwnerId',
                sortable: true,
                editable: true,
                type: 'lookup',
                typeAttributes: {
                    objectApiName: 'User',
                    filter: {
                        criteria: [
                            {
                                fieldPath: 'IsActive',
                                operator: 'eq',
                                value: true,
                            }
                        ]
                    }
                },
                cellAttributes: {
                    class: { fieldName: 'cellClass' }
                }
            },
            {
                label: 'Phone',
                fieldName: 'Phone',
                type: 'phone',
                editable: true,
                cellAttributes: {
                    class: { fieldName: 'cellClass' }
                }
            },
            {
                label: 'Website',
                fieldName: 'Website',
                type: 'url',
                editable: true,
                cellAttributes: {
                    class: { fieldName: 'cellClass' }
                }
            },
            {
                label: 'Annual Revenue',
                fieldName: 'AnnualRevenue',
                type: 'currency',
                editable: true,
                cellAttributes: {
                    class: { fieldName: 'cellClass' }
                }
            }
        ];
    }

    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this.appendCustomCssStyles();
        }
    }

    appendCustomCssStyles() {
        const style = document.createElement('style');

        let customCss = `
            .non-editable .slds-cell-edit__button {
                display: none;
            }
        `

        style.innerText = customCss.replace(/ +(?= )\n+/g, '');
        this.template.querySelector('.custom-css-container').appendChild(style);
    }

    handleSort(event) {
        try {
            const { fieldName: sortedBy, sortDirection } = event.detail;

            this.data = this.sortData(this.data, sortedBy, sortDirection);
            this.sortDirection = sortDirection;
            this.sortedBy = sortedBy;
        } catch (e) {
            this.showErrorToast(e);
        }
    }

    sortData(data, sortedBy, sortDirection) {
        const cloneData = [...data];

        const reverse = sortDirection === 'asc' ? 1 : -1;
        cloneData.sort((a, b) => {
            if (sortedBy === 'Id') {
                a = a['Name'];
                b = b['Name'];
            } else if (sortedBy === 'OwnerId') {
                a = a['Owner']['Name'];
                b = b['Owner']['Name'];
            } else {
                a = a[sortedBy];
                b = b[sortedBy];
            }

            return reverse * ((a > b) - (b > a));
        });

        return cloneData;
    }

    async handleSearch(event) {
        try {
            this.accountName = event.target.value;
        } catch (e) {
            this.showErrorToast(e);
        }
    }

    async handleSave(event) {
        try {
            // Convert datatable draft values into record objects
            const records = event.detail.draftValues.slice().map((draftValue) => {
                const fields = Object.assign({}, draftValue);
                return { fields };
            });

            // Clear all datatable draft values
            this.draftValues = [];

            const recordUpdatePromises = records.map((record) => updateRecord(record));
            await Promise.all(recordUpdatePromises);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            );

            await refreshApex(this.wiredResult);
        } catch (e) {
            this.showErrorToast(e);
        }
    }

    showErrorToast(e) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Something went wrong',
                variant: 'error'
            })
        );

        console.error(e.message, e.stack);
    }
}