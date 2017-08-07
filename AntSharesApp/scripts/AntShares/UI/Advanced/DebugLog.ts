namespace AntShares.UI.Advanced {
    export class DebugLog extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#debug1").click(this.OnDebugClick1);

        }

        protected onload(args: any[]): void {

        }

        private OnDebugClick1 = (str: string): void => {
            if (Global.isMainNet == true) {
                debugLog("主网1.0");
            } else{
                debugLog("测试网1.0");
            }
        }
    }
}