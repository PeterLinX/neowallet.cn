namespace AntShares {
    export class SyncHeight {
        private height = 0;
        public static heightChanged = new __event(SyncHeight);

        public processHeight = () => {
            Promise.resolve(1).then(() => {
                return this.getNewHeight2();
            }).then(() => {
                let localHeight: number;
                if (Global.height == 0) {
                    localHeight = this.height;
                } else {
                    localHeight = Global.height;
                }
                let remoteHeight = this.height;
                $(".remote_height").text(remoteHeight);
                let process = (localHeight / remoteHeight * 100).toFixed(1);
                $(".progress-bar").css("width", process + "%");
                $(".progress-bar").attr("aria-valuenow", process + "%");
                $(".local_process").text(process);
                $(".local_height").text(localHeight);
            }).then(() => {
                if (this.height - Global.height >= 1) {
                    debugLog("Sync");
                    Global.count = 0;
                    Global.height = this.height;
                    SyncHeight.heightChanged.dispatchEvent(null);
                    setTimeout(this.processHeight.bind(SyncHeight), Global.reConnectMultiplier * 1000);
                } else {
                    setTimeout(this.processHeight.bind(SyncHeight), 5000);
                }
            }).catch(error => {
                setTimeout(this.processHeight.bind(SyncHeight), Global.reConnectMultiplier * 1000);
            });
        }

        private getNewHeight1 = (): JQueryPromise<any> => {
            return Global.RestClient.getHeight().then(response => {
                let height: JSON = JSON.parse(response);
                this.height = height["height"];
            });
        }

        private getNewHeight2 = (): PromiseLike<any> => {
            return Global.RpcClient.call("getblockcount", []).then(height => {
                this.height = height;
            });
        }
    }

}
