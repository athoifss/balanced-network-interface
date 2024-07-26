import { SupportedChainId as NetworkId } from './chain';

const MAINNET_ADDRESSES = {
  loans: 'cx66d4d90f5f113eba575bf793570135f9b10cece1',
  staking: 'cx43e2eec79eb76293c298f2b17aec06097be606e0',
  dividends: 'cx203d9cd2a669be67177e997b8948ce2c35caffae',
  reserve: 'cxf58b9a1898998a31be7f1d99276204a3333ac9b3',
  daofund: 'cx835b300dcfe01f0bdb794e134a0c5628384f4367',
  rewards: 'cx10d59e8103ab44635190bd4139dbfd682fa2d07e',
  dex: 'cxa0af3165c08318e988cb30993b3048335b94af6c',
  rebalancing: 'cx40d59439571299bca40362db2a7d8cae5b0b30b0',
  governance: 'cx44250a12074799e26fdeee75648ae47e2cc84219',
  band: 'cxe647e0af68a4661566f5e9861ad4ac854de808a2',
  router: 'cx21e94c08c03daee80c25d8ee3ea22a20786ec231',
  airdrip: 'cxaf244cf3c7164fe6f996f398a9d99c4d4a85cf15',
  sicx: 'cx2609b924e33ef00b648a409245c7ea394c467824',
  bnusd: 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
  baln: 'cxf61cd5a45dc9f91c15aa65831a30a90d59a09619',
  bwt: 'cxcfe9d1f83fa871e903008471cca786662437e58d',
  multicall: 'cxa4aa9185e23558cff990f494c1fd2845f6cbf741',
  disbursement: 'cxe3905591929d17fc8496ae28ee3b9c144579228e',
  stabilityfund: 'cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6',
  stakedLp: 'cx8dc674ce709c518bf1a6058a2722a59f94b6fb7f',
  balancedOracle: 'cx133c6015bb29f692b12e71c1792fddf8f7014652',
  bbaln: 'cxe0252e6c1fe4040412811d83d13979e335287e45',
  feeHandler: 'cx5faae53c4dbd1fbe4a2eb4aab6565030f10da5c6',
  bribe: 'cx28497aef34ec44ad2be9249daddfbe34b54f309a',
  assetManager: 'cxabea09a8c5f3efa54d0a0370b14715e6f2270591',
  xCall: 'cxa07f426062a1384bdd762afa6a87d123fbc81c75',
  xCallManager: 'cx227f747ab644a1f453a0708a55fe6155b9e0abbb',
  savings: 'cxd82fb5d3effecd8c9071a4bba3856ad7222c4b91',
  trickler: 'cx9345f80d6c98357ccbb70392b14162199c2c5f66',
  nol: 'cx4cdfb47cc8a4e39a72220bcd74dc752a30af8b74',
  icxBurner: 'cxdc30a0d3a1f131565c071272a20bc0b06fd4c17b',
};

const YEOUIDO_ADDRESSES = {
  loans: 'cx3259f3ff9a51ca3bf170d4ff9104cf4af126ca1c',
  staking: 'cx9d829396d887f9292d8af488fab78ad24ab6b99a',
  dividends: 'cx5b996d251009340f7c312b9df5c44f0f39a20a91',
  reserve: 'cx1754666c6779dc5e495a462144dd15e4a68fe776',
  daofund: 'cx430955c5a5e2a6e48c1f2aaa7258dc4c84222247',
  rewards: 'cx893fccdd0881d8e2bd2625f711b38e06848ecb89',
  dex: 'cx399dea56cf199b1c9e43bead0f6a284bdecfbf62',
  rebalancing: 'cx2e3398dfce78a3c83de8a41d7c5f4aa40d3a4f30',
  governance: 'cx483630769b61b76387d6ed90c911c16da546784f',
  band: 'cx61a36e5d10412e03c907a507d1e8c6c3856d9964',
  router: 'cx4c456f4a02d2576fe712ea10b311a5fe8d06d205',
  airdrip: 'cx8ed4fbee9d6497f91ea90933db288ff4b43e54ba',
  sicx: 'cxae6334850f13dfd8b50f8544d5acb126bb8ef82d',
  bnusd: 'cxc48c9c81ceef04445c961c5cc8ff056d733dfe3a',
  baln: 'cx36169736b39f59bf19e8950f6c8fa4bfa18b710a',
  bwt: 'cx5d886977b7d24b9f73a460c9ca2d43847997c285',
  multicall: '',
  disbursement: '',
  stabilityfund: '',
  stakedLp: '',
  balancedOracle: '',
  bbaln: '',
  feeHandler: '',
  bribe: '',
  assetManager: '',
  xCall: '',
  xCallManager: '',
  savings: '',
  trickler: '',
  nol: '',
  icxBurner: '',
};

const SEJONG_ADDRESSES = {
  loans: 'cxc5e1eae2f3560f266ea35fe34b1a39db9c99cc69',
  staking: 'cxfbf525229307669cbf8be7faddbe48c96fb52209',
  dividends: 'cx5f123b9a221882d92c508a7eaf0c66bb11e1c216',
  reserve: 'cxf07d3baf2eecdad496468b1047f68bb90036136c',
  daofund: 'cxb67b8445b679c32fa0f95278f9263674a2bdcc1f',
  rewards: 'cxdbbd4deb3e46d3dff280406d2c795cdfcd1ebcfd',
  dex: 'cx648a6d9c5f231f6b86c0caa9cc9eff8bd6040999',
  rebalancing: 'cxaa6f520b655d5fb2d43feae45e83d093c88f58f6',
  governance: 'cx541e2e8b9673e736b727e3f6313ada687539f50f',
  band: 'cx900e2d17c38903a340a0181523fa2f720af9a798',
  router: 'cxf9e996d3ab20b83ed6bacb28ebf157c484c4b695',
  airdrip: '',
  sicx: 'cx70806fdfa274fe12ab61f1f98c5a7a1409a0c108',
  bnusd: 'cx5838cb516d6156a060f90e9a3de92381331ff024',
  baln: 'cx303470dbc10e5b4ab8831a61dbe00f75db10c38b',
  bwt: 'cx68b822ae2acc76e9ec6143a8afbeb79e50a26e8f',
  multicall: 'cx02510602b5f028ee418fc5a8ba893aa2dbb56ece',
  disbursement: '',
  stabilityfund: 'cx342c69da9d8ac099f10fc4eb226ae0de54d8097f',
  stakedLp: 'cx0c3848f0fbb714fcb104e909e3fc1250b8cf9e7f',
  balancedOracle: '',
  bbaln: '',
  feeHandler: '',
  bribe: '',
  assetManager: '',
  xCall: '',
  xCallManager: '',
  savings: '',
  trickler: '',
  nol: '',
  icxBurner: '',
};

const BERLIN_ADDRESSES = {
  loans: 'cx501cce20fc5d5a0e322d5a600a9903f3f4832d43',
  staking: 'cxe41e5f42b982eb88f80381ae776d1aac09b74885',
  dividends: 'cxaa5119be1f73806015cd83dbd8c3fb0c0ac409de',
  reserve: 'cxb79b3fac6c9dcc014cb434be46edeb9ae8cf9640',
  daofund: 'cx6089e7ec850154c7d0d987d4020e242881de4fd1',
  rewards: 'cxe6a949af5f13ef58cf5657fa5c8d4cc28cb790c7',
  dex: 'cx9044771dad80611ee747ffce21949dc3f33f0948',
  rebalancing: 'cxa1d59c77d22b0fd550ebe3c0fb123e86fd888b05',
  governance: 'cx421d370f8f5bbff7b1d52604955c6fa6164095b4',
  band: 'cx80752674c216c209264abc331cd08e1a64eb7c57',
  router: 'cxfcfb55f5b9c066b107c4a16cb2ea3d9c7ca97f30',
  airdrip: '',
  sicx: 'cxb7d63658e3375f701af9d420ea351d0736760634',
  bnusd: 'cxd06f80e28e989a67e297799ab1fb501cdddc2b4d',
  baln: 'cx026a11686efc8f52243415adb217ec9a1bc50433',
  bwt: 'cx7186c15188051e43dc16bdc7c3e2588443df6772',
  multicall: 'cxf7abc88ad52e21e8463ecb2070465eddbe31309c',
  disbursement: 'cxda35146882308a6bb26519738ffef85bb8d7535e',
  stabilityfund: 'cx71e3b1b52b9feb2fe96f99b02b4b32cc86879490',
  stakedLp: 'cxf685f3cfebbeedece3d0b846fe2a670aca932737',
  balancedOracle: 'cx2dc21a1b7f602d49bfe64a49970fe02153ddf487',
  bbaln: 'cx1d4041551759c48f5679e535ba9b83e4669ba6e9',
  feeHandler: 'cx2ed63dab73494be7814c1b0d47044656d493a77d',
  bribe: '',
  assetManager: 'cx957ee1fe04ced630f8e5d78ca74610cd55fc419d',
  xCall: 'cx5b0bd4bb62e2b511aa29586c1e8a21749425d474',
  xCallManager: '',
  savings: '',
  trickler: '',
  nol: '',
  icxBurner: '',
};

const LISBON_ADDRESSES = {
  loans: 'cx87e73719307199fa01426d0feff528d6f3fbfe07',
  staking: 'cx442b5db251e4f27371cc5b8479a4672c0e6ae32d',
  dividends: 'cx211fe0f9c23f444b4e9757785b53c61da79c0e80',
  reserve: 'cxdf703b8dfe39ea65509707d8c8b411b114c6da7e',
  daofund: 'cx416a9ffc1cf126aca198d940f2065bfd27fe6adc',
  rewards: 'cx0e6c153fd2af98c74453563427694168b214a53f',
  dex: 'cx7a90ed2f781876534cf1a04be34e4af026483de4',
  rebalancing: 'cx6d673012fbc854f6915f7a2ca34b404695336e9a',
  governance: 'cxdb3d3e2717d4896b336874015a4b23871e62fb6b',
  band: 'cxeda795dcd69fe3d2e6c88a6473cdfe5532a3393e',
  router: 'cx2576925d931f3be8ff195914c10a87da2094c5e5',
  airdrip: '',
  sicx: 'cx2d013cb55781fb54b81d629aa4b611be2daec564',
  bnusd: 'cx87f7f8ceaa054d46ba7343a2ecd21208e12913c6',
  baln: 'cxc3c552054ba6823107b56086134c2afc26ab1dfa',
  bwt: 'cxd3c090fdf1cd2882730961491188527da5fee806',
  multicall: 'cxfe61a2d95ebf477824d2b66a86736bcf4c3f6f65',
  disbursement: 'cx224192f83983a7d09e2dbe2e59aaacaef5a79484',
  stabilityfund: 'cx7d26fd58b5f2af3a784030f3cbeb2e7e4d57fc3d',
  stakedLp: 'cx0e04a92802d171a8d9f318f6568af47d68dba902',
  balancedOracle: 'cxeda795dcd69fe3d2e6c88a6473cdfe5532a3393e',
  bbaln: 'cxb0cafb790fb312e40d8c5ac88e15b15d46aad222',
  feeHandler: 'cxf19dfddfb2050a2424a8f9a799255c09271b5e08',
  bribe: 'cxb40b43813ca8bb47ceb3d589084033f4e1aec1c8',
  assetManager: 'cxe9d69372f6233673a6ebe07862e12af4c2dca632',
  xCall: 'cx15a339fa60bd86225050b22ea8cd4a9d7cd8bb83',
  xCallManager: 'cx5040180f7b0cd742658cb9050a289eca03083b70',
  savings: 'cxf57a458a09bf8796024ecaad7ac6ac3987ed68d4',
  trickler: 'cx223bb0520fb6ac4faca4a59d4cca77fbe3ebe3c1',
  nol: '',
  icxBurner: '',
};

const HAVAH_ADDRESSES = {
  loans: '',
  staking: '',
  dividends: '',
  reserve: '',
  daofund: '',
  rewards: '',
  dex: '',
  rebalancing: '',
  governance: '',
  band: '',
  router: '',
  airdrip: '',
  sicx: '',
  bnusd: 'cx4b40466250f9ccf04cc92da1b6633968ba3ec7cc',
  baln: '',
  bwt: '',
  multicall: '',
  disbursement: '',
  stabilityfund: '',
  stakedLp: '',
  balancedOracle: '',
  bbaln: '',
  feeHandler: '',
  bribe: '',
  assetManager: 'cx9d6114d4187ee7ff7061a3faaf4dbc76b0c2c440',
  xCall: 'cx00104193d0a593c4b57fda544d1b7c88b8ed4fae',
  xCallManager: 'cx49afee1a85186bacb921c5a8ee1df329e006e340',
  savings: '',
  trickler: '',
  nol: '',
  icxBurner: '',
};

const addresses = {
  [NetworkId.MAINNET]: MAINNET_ADDRESSES,
  [NetworkId.YEOUIDO]: YEOUIDO_ADDRESSES,
  [NetworkId.SEJONG]: SEJONG_ADDRESSES,
  [NetworkId.BERLIN]: BERLIN_ADDRESSES,
  [NetworkId.LISBON]: LISBON_ADDRESSES,
  [NetworkId.HAVAH]: HAVAH_ADDRESSES,
};

export default addresses;
