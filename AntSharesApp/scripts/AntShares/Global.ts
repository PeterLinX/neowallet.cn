/// <reference path="../sdk/AntShares/Network/REST/RestClient.ts"/>

namespace AntShares {
    export class Global {
        public static isMainNet: boolean = true;
        public static isDebug: boolean = false;
        public static isConnected: boolean = false;
        public static reConnectMultiplier: number = 15;
        public static height: number = 0;
        public static count: number = 0;

        public static RestClient = new Network.REST.RestClient("http://api.otcgo.cn", Global.isMainNet);


        //MainNet
        public static mainHttpNetList: string[] = ["http://seed8.antshares.org:10332"];
        public static mainHttpsNetList: string[] = ["https://seed8.antshares.org:10331"];
        //TestNet
        public static testNetList: string[] = ["http://seed8.antshares.org:20332"];

        public static Wallet: Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient: Network.RPC.RpcClient;
        public static Blockchain: Core.Blockchain;
        public static Node: Network.RemoteNode;

        
    }

}
