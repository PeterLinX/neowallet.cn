namespace AntShares {
    export class SyncHeight {
        private height = 0;
        public static heightChanged = new __event(SyncHeight);

        public processHeight = () => {
            Promise.resolve(1).then(() => {
                return this.getNewHeight();
            }).then(() => {
                let localHeight = Global.height;
                let remoteHeight = this.height;
                $(".remote_height").text(remoteHeight);
                let process = (localHeight / remoteHeight * 100).toFixed(1);
                $(".progress-bar").css("width", process + "%");
                $(".progress-bar").attr("aria-valuenow", process + "%");
                $(".local_process").text(process);
                $(".local_height").text(localHeight);
            }).then(() => {
                if (this.height - Global.height >= 1) {
                    debugLog("biu~");
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

        private getNewHeight = (): JQueryPromise<any> => {
            return Global.RestClient.getHeight().then(response => {
                let height: JSON = JSON.parse(response);
                this.height = height["height"];
            });
        }


    }

}
