module App {

    export class Utils {

        public static getTimestamp(): string {
            return '?_=' + new Date().getTime();
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
        public static filterByProperty(entities: Array<any>, val: any): Array<any> {
            if (!!!entities) { return []; }
            var filtered = [];
            entities.forEach(function (entity) {
                for (var prop in entity) {
                    if (entity[prop] == val) {
                        filtered.push(entity);
                    }
                }
            });
            return filtered;
        }

        /**
        * Find and return unique values from an array.
        * 
        * @param inputArray:Array
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