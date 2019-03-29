import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    AssetState,
    NeonService,
    GlobalService,
    TransactionState,
    ChromeService,
    HttpService,
} from '@app/core';
import {
    Balance,
    PageData,
    Transaction,
    RateObj
} from 'src/models/models';
import {
    ActivatedRoute,
    Router
} from '@angular/router';

@Component({
    templateUrl: 'detail.component.html',
    styleUrls: ['detail.component.scss']
})
export class AssetDetailComponent implements OnInit, OnDestroy {
    private address: string = '';
    public balance: Balance;
    public txPage: PageData < Transaction > ;
    private assetId: string = '';
    private requesting = false;
    public loading = true;
    public inTransaction: Array < Transaction > ;
    public rateObj: RateObj;

    imageUrl: any;

    constructor(
        private asset: AssetState,
        private neon: NeonService,
        public global: GlobalService,
        private router: Router,
        private aRoute: ActivatedRoute,
        private transaction: TransactionState,
        private txState: TransactionState,
        private chrome: ChromeService,
        private http: HttpService,
    ) {}

    ngOnInit(): void {
        this.address = this.neon.address;
        this.transaction.data().subscribe((res) => {
            this.txPage = res;
        });
        this.chrome.getRateObj().subscribe(rateObj => {
            this.rateObj = rateObj;
        });
        this.aRoute.params.subscribe((params) => {
            this.txPage = undefined;
            this.asset.detail(params.id).subscribe((res) => {
                this.balance = res;
                this.assetId = params.id;
                this.transaction.fetch(this.address, 1, params.id, true);
                // 获取资产头像
                this.asset.getAssetSrc(this.assetId).subscribe(assetRes => {
                    if (typeof assetRes === 'string') {
                        this.imageUrl = assetRes;
                    } else {
                        this.asset.setAssetFile(assetRes, this.assetId).then(src => {
                            this.imageUrl = src;
                        });
                    }
                });
                // 获取资产汇率
                if (this.balance.balance && this.balance.balance > 0) {
                    let query = {};
                    query['symbol'] = this.rateObj.currentCurrency;
                    query['channel'] = this.rateObj.currentChannel;
                    query['coins'] = this.balance.symbol;
                    this.asset.getRate(query).subscribe(rateBalance => {
                        if (rateBalance.result.length > 0) {
                            this.balance.rateBalance =
                                Number(Object.values(rateBalance.result[0])[0]) * this.balance.balance;
                        }
                    });
                }
            });
        });
        this.getInTransactions();
    }

    ngOnDestroy(): void {
        this.txPage = {
            page: 1,
            pages: 0,
            items: [],
            total: 0,
            per_page: 10
        };
    }

    private getInTransactions() {
        this.txState.data().subscribe((res: any) => {
            if (this.txPage === undefined || res.page === 1) {
                this.chrome.getTransaction().subscribe(inTxData => {
                    if (inTxData[this.address] === undefined || inTxData[this.address][this.assetId] === undefined) {
                        this.inTransaction = [];
                    } else {
                        this.inTransaction = inTxData[this.address][this.assetId];
                    }
                    const txIdArray = [];
                    this.inTransaction.forEach(item => {
                        txIdArray.push(item.txid);
                    });
                    this.http.post(`${this.global.apiDomain}/v1/transactions/confirms`, {
                        txids: txIdArray
                    }).subscribe(txConfirm => {
                        txConfirm = txConfirm.result;
                        txConfirm.forEach(item => {
                            const tempIndex = this.inTransaction.findIndex(e => e.txid === item);
                            if (tempIndex >= 0) {
                                this.inTransaction.splice(tempIndex, 1);
                            }
                        });
                        if (inTxData[this.address] === undefined || inTxData[this.address][this.assetId] === undefined) {
                            inTxData[this.address] = {};
                            inTxData[this.address][this.assetId] = [];
                        } else {
                            inTxData[this.address][this.assetId] = this.inTransaction;
                        }
                        this.chrome.setTransaction(inTxData);
                        this.txPage = res;
                        this.txPage.items = this.inTransaction.concat(this.txPage.items);
                    }, error => {});
                });
            } else {
                this.txPage = res;
            }
        });
    }

    public page(page: number) {
        let maxId = -1;
        let sinceId = -1;
        if (page > this.txPage.page) {
            maxId = this.txPage.items[this.txPage.items.length - 1].id;
        } else {
            sinceId = this.txPage.items[0].id;
        }
        this.txState.fetch(this.address, page, this.assetId, true, maxId, sinceId, Math.abs(this.txPage.page - page)).finally(() => {});
    }


    public receive() {
        this.router.navigate([{
            outlets: {
                transfer: ['transfer', 'receive']
            }
        }]);
    }
    public transfer() {
        this.router.navigate([{
            outlets: {
                transfer: ['transfer', 'create', this.balance.asset_id]
            }
        }]);
    }
}
