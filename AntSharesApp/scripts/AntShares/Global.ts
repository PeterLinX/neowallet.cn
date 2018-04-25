/// <reference path="../sdk/AntShares/Network/REST/RestClient.ts"/>
/// <reference path="../sdk/AntShares/Network/REST/otcgo.ts"/>

namespace AntShares {
    export class Global {
        public static isMainNet: boolean = true;
        public static isDebug: boolean = false;
        public static isConnected: boolean = false;
        public static reConnectMultiplier: number = 15;
        public static height: number = 0;
        public static count: number = 0;

        public static RestClient = new Network.REST.RestClient("https://api.otcgo.cn", Global.isMainNet);
        public static api = new Network.REST.otcgo(Global.isMainNet);


        //MainNet
        public static mainHttpNetList: string[] = ["http://seed1.redpulse.com:10332",
                                                   "http://seed2.redpulse.com:10332",
                                                   "http://seed1.neo.org:10332",
                                                   "http://seed2.neo.org:10332",
                                                   "http://seed3.neo.org:10332",
                                                   "http://seed4.neo.org:10332",
                                                   "http://seed5.neo.org:10332"
        ];
        public static mainHttpsNetList: string[] = ["https://seed1.neo.org:10331",
                                                    "https://seed3.neo.org:10331",
                                                    "https://seed2.switcheo.network:10331",
                                                    "https://seed3.switcheo.network:10331",
                                                    "https://seed4.switcheo.network:10331",
                                                    "https://seed1.redpulse.com:10331",
                                                    "https://seed2.redpulse.com:10331"
        ];
        //TestNet
        public static testNetList: string[] = ["http://seed1.neo.org:20332", "http://seed2.neo.org:20332", "http://seed3.neo.org:20332", "http://seed4.neo.org:20332", "http://seed5.neo.org:20332"];

        public static Wallet: Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient: Network.RPC.RpcClient;
        public static Blockchain: Core.Blockchain;
        public static Node: Network.RemoteNode;

        
    }

}
