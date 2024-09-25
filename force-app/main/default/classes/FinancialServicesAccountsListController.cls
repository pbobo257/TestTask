public with sharing class FinancialServicesAccountsListController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String name) {
        try {
            return [
                SELECT
                    Id,
                    Name,
                    OwnerId,
                    Owner.Name,
                    Phone,
                    Website,
                    AnnualRevenue,
                    UserRecordAccess.HasEditAccess
                FROM Account
                WHERE Industry = 'Financial Services'
                    AND Name LIKE :('%' + name + '%')
                WITH USER_MODE
                LIMIT 50000
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}