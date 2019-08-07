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
        public static mainHttpNetList: string[] = [
            "http://seed1.ngd.network:10332",
            "http://seed2.ngd.network:10332",
            "http://seed3.ngd.network:10332",
            "http://seed4.ngd.network:10332",
            "http://seed5.ngd.network:10332",
            "http://seed6.ngd.network:10332",
            "http://seed7.ngd.network:10332",
            "http://seed8.ngd.network:10332",
            "http://seed9.ngd.network:10332",
            "http://seed10.ngd.network:10332",
        ];

        public static mainHttpsNetList: string[] = [
            "https://seed11.ngd.network:10331",
            "https://seed12.ngd.network:10331",
        ];

        //TestNet
        public static testNetList: string[] = [
            "http://seed1.ngd.network:20332",
            "http://seed2.ngd.network:20332",
            "http://seed3.ngd.network:20332",
            "http://seed4.ngd.network:20332",
            "http://seed5.ngd.network:20332",
            "http://seed6.ngd.network:20332",
            "http://seed7.ngd.network:20332",
            "http://seed8.ngd.network:20332",
            "http://seed9.ngd.network:20332",
            "http://seed10.ngd.network:20332",
        ];

        public static Wallet: Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient: Network.RPC.RpcClient;
        public static Blockchain: Core.Blockchain;
        public static Node: Network.RemoteNode;

        
    }

}
