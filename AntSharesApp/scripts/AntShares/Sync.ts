namespace AntShares
{
    export class Sync
    {
        private callNode2 = (node: string): PromiseLike<Map<boolean, string>> => {
            let dictionary = new Map<boolean, string>();
            let rpcClient = new AntShares.Network.RPC.RpcClient(node);
            return rpcClient.call("getblockcount", []).then(resolve => {
                dictionary.set(true, node);
                return dictionary;
            }, reject => {
                dictionary.set(false, node);
                return dictionary;
            });
        }

        private callNode = (node: string): PromiseLike<Map<boolean, string>> => {
            let dictionary = new Map<boolean, string>();
            return fetch(node).then(result => {
                dictionary.set(true, node);
                return Promise.resolve(dictionary);
            }).catch(error => {
                dictionary.set(false, node);
                return Promise.resolve(dictionary);
            });
        }

        public connectNode = () => {
            debugLog("Connect Node");
            Promise.resolve(1).then(() => {
                let promises = [];
                let nodeList: string[] = new Array<string>();

                if (Global.isMainNet) {
                    if (isMobileApp.App()) {
                        //MainNet App https&http
                        //nodeList = Global.mainHttpsNetList.concat(Global.mainHttpNetList);
                        nodeList = Global.mainHttpNetList;
                    } else {
                        //MainNet PC Web https
                        nodeList = Global.mainHttpsNetList;
                    }
                } else {
                    //TestNet
                    nodeList = Global.testNetList;
                }
                for (let i = 0; i < nodeList.length; i++) {
                    promises[i] = this.callNode(nodeList[i]);
                }
                return Promise.all(promises);
            }).then(results => {
                let node: string;
                for (let i = 0; i < results.length; i++) {
                    if ((<any>results[i]).has(true)) {
                        Global.isConnected = true;
                        node = (<any>results[i]).get(true);
                        break;
                    }
                }
                if (Global.isConnected)
                {
                    if (Global.RpcClient == null) {
                        Global.RpcClient = new Network.RPC.RpcClient(node);
                        Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                        Global.Node = new Network.RemoteNode(Global.RpcClient);
                    } else {
                        if (Global.RpcClient.Url != node) {
                            Global.RpcClient = new Network.RPC.RpcClient(node);
                            Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                            Global.Node = new Network.RemoteNode(Global.RpcClient);
                        }
                    }
                } else {
                    throw new Error("The Network is down.");
                }
            }).then(() => {
                setTimeout(this.connectNode.bind(Sync), AntShares.Core.Blockchain.SecondsPerBlock * 1000);
                //return delay(AntShares.Core.Blockchain.SecondsPerBlock * 1000).then(() => {
                //    return AntShares.Sync.connectNode();
                //});
                //AntShares.Sync.connectNode(Global.isMainNet);
            }).catch(error => {
                debugLog(error.message);
                setTimeout(this.connectNode.bind(Sync), Global.reConnectMultiplier * 1000);
                //return delay(Global.reConnectMultiplier * 1000).then(() => {
                //    return AntShares.Sync.connectNode();
                //});
            });

        }

        public timer = () => {
            $("#countTimer").text(Global.count);
            Global.count++;
            setTimeout(this.timer.bind(Sync), 1000);
        }

    }

}
