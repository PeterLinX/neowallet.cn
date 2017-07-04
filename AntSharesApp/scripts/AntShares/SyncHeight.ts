namespace AntShares {
    export class SyncHeight {
        private height = 0;
        public static heightChanged = new __event(SyncHeight);

        public processHeight = () => {
            Promise.resolve(1).then(() => {
                return this.getNewHeight();
            }).then(() => {
                debugLog("height: " + this.height);
                debugLog("GlobalHeight: " + Global.height);
                if (this.height - Global.height >= 1) {
                    debugLog("biu");
                    Global.count = 0;
                    Global.height = this.height;
                    SyncHeight.heightChanged.dispatchEvent(null);
                    setTimeout(this.processHeight.bind(this), Global.reConnectMultiplier * 1000);
                } else {
                    setTimeout(this.processHeight.bind(this), 5000);
                }
            }).catch(error => {
                setTimeout(this.processHeight.bind(this), Global.reConnectMultiplier * 1000);
            });
        }

        private getNewHeight = (): JQueryPromise<any> => {
            return Global.RestClient.getHeight().then(response => {
                let height: JSON = JSON.parse(response);
                this.height = height["height"];
            });
        }
    }

}
