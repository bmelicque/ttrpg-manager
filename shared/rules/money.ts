export function formatMoney(money: number): string {
    const coins = [];
    const gold = Math.floor(money / 100);
    if (gold > 0) coins.push(`${gold} po`);
    money -= gold * 100;
    const silver = Math.floor(money / 10);
    if (silver > 0) coins.push(`${silver} pa`);
    money -= silver * 10;
    if (money > 0) coins.push(`${money} pc`);
    return coins.join(" ");
}
