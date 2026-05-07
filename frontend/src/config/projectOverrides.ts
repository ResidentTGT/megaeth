export type ProjectOverride = {
  name: string;
  comment: string;
  referralUrl?: string;
};

export const projectOverrides: readonly ProjectOverride[] = [
  {
    name: "AveForge",
    referralUrl: "https://aveforge.gg/?referralCode=resident3342",
    comment:
      "PvE-игра, сражаешься с ботами с механикой выбора 1 из 3 действий. Чтобы зайти, надо купить лицензию за 0.0065 ETH. В игре есть лутбоксы. Все для прокачки можно купить на OpenSea.",
  },
  {
    name: "Hit.One",
    referralUrl: "https://app.hit.one/r/NMAE4M",
    comment: "LONG/SHORT с 500x плечом. Лудка с комиссиями.",
  },
  {
    name: "Blackhaven",
    comment:
      "Депозит USDm, за что получаешь RBT, которые можно застейкать в экосистеме MegaETH. История про ликвидность.",
  },
  {
    name: "Brix",
    comment:
      "Тут можно купить wiTRY, yield-обертку над iTRY, который является стейблкоином турецкой лиры. Этот wiTRY можно потом где-то застейкать в экосистеме. История про ликвидность.",
  },
  {
    name: "TopStrike",
    referralUrl: "https://play.topstrike.io?invite=ZA5R8LBE",
    comment: "",
  },
  {
    name: "GMX",
    comment: "",
    referralUrl: "https://app.gmx.io/#/trade/?ref=resident",
  },
];
