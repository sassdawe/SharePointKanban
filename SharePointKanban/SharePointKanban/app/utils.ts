module App {

    export class Utils {

        public static userIsEditor(user: SharePoint.ISpUser, targetGroups: Array<string>): boolean {
            for (var i = 0; i < targetGroups.length; i++) {
                for (var j = 0; j < user.Groups.length; j++) {
                    if (targetGroups[i] == user.Groups[j].name) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
        * Returns the index of a value in an array. Returns -1 if not found. Use for IE8 browser compatibility.
        * @param a: Array<any>
        * @param value: any
        * @return number
        */
        public static indexOf(a: Array<any>, value: any): number {

            // use the native Array.indexOf method if exists
            if (!!Array.prototype.indexOf) {
                return Array.prototype.indexOf.apply(a, [value]);
            }

            for (var i = 0; i < a.length; i++) {
                if (a[i] === value) {
                    return i;
                }
            }

            return -1;
        }

        public static getTimestamp(): string {
            return '?_=' + new Date().getTime();
        }

        public static parseMsDateTicks(val: any): Date {
            if (val == null) { return val; }
            return new Date(parseInt(val.replace(/\D/g, '')));
        }

        public static toUTCDateTime(date: Date): string {
            if (!!!date) { return <any>date; }
            else if (date.constructor === String) {
                date = Utils.parseMsDateTicks(date);
            }
            var m = date.getUTCMinutes(),
                h = date.getUTCHours(),
                s = date.getUTCSeconds();
            return date.toLocaleDateString()
                + ' ' + (h < 10 ? '0' + h : h)
                + ':' + (m < 10 ? '0' + m : m)
                + ':' + (s < 10 ? '0' + s : s);
        }

        /**
        * Parse dates in format: "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD", "/Date(1442769001000)/", or YYYY-MM-DDTHH:MM:SSZ
        * @param val: string
        * @return Date
        */
        public static parseDate(val: any): Date {

            if (!!!val) { return null; }

            if (typeof val == 'object' && val.constructor == Date) { return val; }

            var rxSlash: RegExp = /\d{1,2}\/\d{1,2}\/\d{2,4}/, // "09/29/2015" 
                rxHyphen: RegExp = /\d{1,2}-\d{1,2}-\d{2,4}/, // "09-29-2015"
                rxIsoDate: RegExp = /\d{4}-\d{1,2}-\d{1,2}/, // "2015-09-29"
                rxTicks: RegExp = /(\/|)\d{13}(\/|)/, // "/1442769001000/"
                rxIsoDateTime: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
                tmp: Array<string>,
                m: number,
                d: number,
                y: number,
                time: Array<string>,
                date: Date = null;

            val = rxIsoDate.test(val) ? val : (val + '').replace(/[^0-9\/\-]/g, '');
            if (val == '') { return null; }

            if (rxSlash.test(val) || rxHyphen.test(val)) {
                tmp = rxSlash.test(val) ? val.split('/') : val.split('-');
                m = parseInt(tmp[0]) - 1;
                d = parseInt(tmp[1]);
                y = parseInt(tmp[2]);
                y = y < 100 ? 2000 + y : y;
                date = new Date(y, m, d, 0, 0, 0, 0);
            }
            else if (rxIsoDate.test(val) || rxIsoDateTime.test(val)) {
                tmp = val.split('-');
                y = parseInt(tmp[0]);
                m = parseInt(tmp[1]) - 1;
                d = parseInt(tmp[2]);
                y = y < 100 ? 2000 + y : y;
                if (/T/.test(val)) {
                    time = val.split('T')[1].split(':');
                    date = new Date(y, m, d, ~~time[0], ~~time[1], ~~time[2]);
                }
                else {
                    date = new Date(y, m, d, 0, 0, 0);
                }
            }
            else if (rxTicks.test(val)) {
                date = new Date(parseInt(val.replace(/\D/g, '')));
            }

            return date;
        }

        /**
        * Filter by Property Value
        * The default Angular `filter` filter throws 'too much recursion' error when filtering a Breeze entity with relationships.
        * This is just a simple filter for a shallow property value search.
        * <p>
        * usage: <div ng-repeat="eb in vm.employeeBenefitItems | by_prop : svc.ServiceId"></div>
        *
        * @param entities Array<any>
        * @return Array<any>
        */
        public static filterByValue(entities: Array<any>, val: any): Array<any> {
            if (!!!entities) { return []; }
            var filtered = [];
            for (var i = 0; i < entities.length; i++) {
                for (var prop in entities[i]) {
                    if (entities[i][prop] == val) {
                        filtered.push(entities[i]);
                    }
                }
            }
            return filtered;
        }

        /**
        * Find and return unique values from an array.
        * 
        * @param inputArray:Array
        * @param keyName
        * @return Array
        */
        public static getUniqueKeyValues(inputArray, keyName): Array<any> {
            var outputArray: Array<any> = [];

            for (var i = 0; i < inputArray.length; i++) {

                var val = inputArray[i][keyName];
                if (outputArray.indexOf(val) > -1) { continue; }

                outputArray.push(val);

            }

            return outputArray.sort();
        }

        public static remove(a: Array<any>, from: number, to: number = undefined): number {
            var rest = a.slice((to || from) + 1 || a.length);
            a.length = from < 0 ? a.length + from : from;
            return a.push.apply(a, rest);
        }

        // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm
        public static clone(objectToBeCloned): any {
            // Basis.
            if (!(objectToBeCloned instanceof Object)) {
                return objectToBeCloned;
            }

            var objectClone;
  
            // Filter out special objects.
            var Constructor = objectToBeCloned.constructor;
            switch (Constructor) {
                // Implement other special objects here.
                case RegExp:
                    objectClone = new Constructor(objectToBeCloned);
                    break;
                case Date:
                    objectClone = new Constructor(objectToBeCloned.getTime());
                    break;
                default:
                    objectClone = new Constructor();
            }
  
            // Clone each property.
            for (var prop in objectToBeCloned) {
                objectClone[prop] = Utils.clone(objectToBeCloned[prop]);
            }

            return objectClone;
        }
    }

}