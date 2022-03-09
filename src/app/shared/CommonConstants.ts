export const COMMON_CONSTANTS = {
    PASSWORD_REGX : '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.*-/\\\\;!])(?=\\S+$).{8,}$',
    EMAIL_REGEX: "^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@" + "[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$",
    CLIENT_EMAIL_REGEX: "/^([\w-\.]+@(?!gmail.com)(?!yahoo.com)(?!aol.com)(?!outlook.com)(?!zoho.com)(?!mail.com)(?!protonmail.com)(?!icloud.com)(?!gmx.com)(?!yandex.com)(?!hubspot.com)(?!hotmail.com)([\w-]+\.)+[\w-]{2,4})?$/",
    MASTER_TABLE_ROW_SIZE: 10,
    MASTER_TABLE_PAGINATE_DROPDOWN:[10,20,30],
    EIN_REGX : '^((?!11-1111111)(?!22-2222222)(?!33-3333333)(?!44-4444444)(?!55-5555555)(?!66-6666666)(?!77-7777777)(?!88-8888888)(?!99-9999999)(?!12-3456789)(?!00-[0-9]{7})([0-9]{2}-[0-9]{7}))*$',
    SSN_REGX : '^((?!111-11-1111)(?!222-22-2222)(?!333-33-3333)(?!444-44-4444)(?!555-55-5555)(?!666-66-6666)(?!777-77-7777)(?!888-88-8888)(?!999-99-9999)(?!123-45-6789)(?!000-[0-9]{2}-[0-9]{4})([0-9]{3}-[0-9]{2}-[0-9]{4}))*$',
    MOBILE_PHONE: '^((\+){1}91){1}[1-9]{1}[0-9]{9}$',
    TRUNCATE_LENGTH : '30',
    WEBSITE_URL:'^(http[s]?://)?([^.:/@#]+)(\\.[^.:/@#]+)+$',
    // WEBSITE_URL:' /^(http[s]?://){0,1}(www.){0,1}[a-zA-Z0-9.-]+.[a-zA-Z]{2,5}[.]{0,1}/'
    // WEBSITE_URL:'(https?://)?(http?://)?(ftp?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
    // WEBSITE_URL:'/^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/'

    COMMON_PASSWORD_FOR_ADMIN_ADD_FUNCTIONALITY: 'jKii@3456',
    blockSpecial: /^[^<>*!&^@#$%()_{}'":;?~`.,<>=+[\]]+$/,
    blockSomeSpecial: /^[^<>*^#$%()_{}'":;?~`<>=+[\]]+$/, 
    // blockSomeSpecial: /^[^<>*^#$%()/\\\-|_{}'":;?~`<>=+[\]]+$/,
    blockSpecialForExperience: /^[A-Z@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i

};
