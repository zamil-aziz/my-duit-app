export async function GET() {
    return new Response(
        JSON.stringify({
            expenses: [],
            summary: {
                totalSpent: 0,
                monthlyAverage: 0,
                largestExpense: 0,
            },
        }),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
