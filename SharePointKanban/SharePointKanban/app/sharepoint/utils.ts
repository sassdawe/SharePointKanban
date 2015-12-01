module App.SharePoint {

    export class Utils {
        /**
        * Ensure site url is or ends with '/'
        * @param url: string
        * @return string
        */
        public static formatSubsiteUrl(url): string {
            return !!!url ? '/' : !/\/$/.test(url) ? url + '/' : url;
        }

        /**
        * Convert a name to REST camel case format
        * @param str: string
        * @return string
        */
        public static toCamelCase(str: string): string {
            return str.toString()
                .replace(/\s*\b\w/g, function (x) {
                    return (x[1] || x[0]).toUpperCase();
                }).replace(/\s/g, '')
                .replace(/\'s/, 'S')
                .replace(/[^A-Za-z0-9\s]/g, '');
        }

        /** 
        * Escape column values
        * http://dracoblue.net/dev/encodedecode-special-xml-characters-in-javascript/155/ 
        */
        public static escapeColumnValue(s): any {
            if (typeof s === "string") {
                return s.replace(/&(?![a-zA-Z]{1,8};)/g, "&amp;");
            } else {
                return s;
            }
        }

        
    }

}