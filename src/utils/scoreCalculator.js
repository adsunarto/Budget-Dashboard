export function calculateScore(transactions, goals) {
    let income = transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    let expenses = transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const score = Math.max(300, 850 - (expenses / income) * 200);
    return Math.round(score);
}
