---
title: "How knowledge reaches the price"
description: "Most Kalshi trades happen in the last few hours before close, so a day out the price barely knows the answer."
short: "Three in four trades land in the last six hours. A day out, the price barely knows the answer."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 3
---

In [an earlier post](/writing/are-prediction-markets-accurate) I found that the last price on a Kalshi market is very good. Score it against what happened and it's close to the truth.

But a price isn't born good. At some point it doesn't know the answer, and later it does. Somewhere in between, knowledge gets in.

I wanted to see when. I had a guess. People don't want to wait for a market to resolve, so they'd rather take their positions close to the finish. That's when you see most of the action.

In 1945 Hayek wrote about "the man on the spot". The person who knows something about this place, this moment, that nobody else knows yet. His point was that no planner can collect that knowledge. A price can, because the person who has it trades on it.

If that's true, you should be able to watch it happen in the trades. When do people show up? When does the price start telling the winners from the losers? And who is it learning from?

## What I looked at

The same data as before. 686,272 trades across 2,906 settled markets on Kalshi, the regulated US prediction market: the Fed, CPI, the S&P 500, the NASDAQ, gas, oil, currencies. The data is from December 2025.

For each trade I measured how long before the market closed it happened, then sorted trades into windows: more than three days out, one to three days, six to 24 hours, one to six hours, and the final hour.

## Most of the trading happens at the end

![Share of trades and contracts by time before close](images/ms-chart-when-trades.png)

Three in four trades, 74.8%, came in the last six hours before the market closed. More than half came in the one to six hours before.

That sounds like a frenzy. It's simpler than that, in two parts.

77% of all the trades were in daily S&P 500 and NASDAQ range markets. "Will the S&P 500 be between 6,900 and 6,925 at 4pm today?" Those markets settle on the 4pm close. The six hours before 4pm are, more or less, the stock market's trading day.

So people trade when the thing they're betting on is moving. The index ticks, someone sees it, they trade. The knowledge doesn't arrive in one go. It arrives a few points at a time, all day, and the trades arrive with it.

The other part is the one I went looking for. Nobody wants money stuck in a market for days where it can't be used for anything else, a cost I wrote about in [why most prediction markets end in NO](/writing/why-prediction-markets-resolve-no). So people take their positions close to the finish, when the answer is near and the money comes back quickly.

The contracts tell a different story. Only half of all contracts traded in those last six hours. More than a third, 37.5%, traded three or more days out, in far fewer, far bigger trades. I'll come back to those.

## A day out, the price barely knows

I split every trade by how the market ended, then compared the average price people paid. If the price knows something, contracts that ended YES should have been trading higher than contracts that ended NO.

![Average price of contracts that ended YES and NO, by time before close](images/ms-chart-separation.png)

Six to 24 hours before the close, contracts that went on to happen averaged 31 cents. Contracts that didn't averaged 22. A gap of 9 cents. The price could barely tell them apart.

One to six hours out, the gap was 15 cents.

In the final hour, it jumped to 37.

The Brier score says the same thing. It's a simple accuracy score: take the price as a probability, compare it to what happened, square the gap. 0 is perfect. 0.25 is a coin flip.

Trades 6 to 24 hours before the close scored **0.240**. One to six hours before, **0.217**. In the final hour, **0.155**. The very last trade before the close, **0.060**.

Six to 24 hours before the close, the average trade was barely better than a coin flip. Read that again. The same markets that end up so sharp spend most of their last day close to guessing.

Then most of what the price knows, it learns in the final hour, and a lot of that in the final minutes.

Two caveats. These are averages over trades, so a busy market counts more than a quiet one. And each window has a slightly different mix of markets, roughly 2,200 to 2,600 in each, mostly the daily ones.

## The longshots get fixed last

In the earlier post I found that cheap contracts happened more often than their price said. Here you can see where that comes from.

![How often 10 to 19 cent contracts happened, by time before close](images/ms-chart-cheap-contracts.png)

Contracts bought at 10 to 19 cents, six to 24 hours before the close, happened 36.7% of the time. More than twice what the price said.

One to six hours out: 24.4%.

In the final hour: 14.9%. Right on the price.

So the longshot gap mostly lives in the hours before the close. My guess is that early on, people write off moves that haven't happened yet. A range that looks far away at 10am is not far away when the index has six hours to wander. By the final hour there's no time left to wander, and the price gets it right.

## The big money comes early, in different markets

Back to the trades that happened three or more days out. They averaged 518 contracts each. Trades in the final six hours averaged about 121.

Those early trades are mostly in a different kind of market. The slow ones, open for weeks.

The Fed is the clearest case. My sample had just 15 Fed rate decision markets. They made up 24% of every contract traded, at 769 contracts a trade. Trades on EUR/USD averaged 61.

The paper I wrote read big trades as institutions. That's plausible but it's a guess. A trade size doesn't tell you who's behind it.

What I'm more confident about is that this is a different kind of knowledge. Nobody learns the Fed's decision by watching a ticker for an afternoon. It's built slowly by people who read every speech, every data release, every word in the minutes. That knowledge arrives early and in large pieces. It's the kind I know best. My own work is forecasting CPI and PCE, and none of it happens in an afternoon.

Trades more than a day out come from a different mix of markets: the ones that stay open that long. There, the price did separate winners from losers, by 37 cents. But it wasn't well calibrated. Contracts traded at 50 to 59 cents that far out happened only 35% of the time. People had the direction roughly right and paid too much for it.

## The average trade knows nothing

One more test. On Kalshi, every trade has a taker: the person who crossed the spread to trade right now, instead of waiting for someone to fill their order. If anyone is acting on fresh knowledge, you'd expect it to be the takers.

In markets that ended YES, takers bought YES 52.2% of the time.

In markets that ended NO, takers bought YES 51.1% of the time.

That's almost no difference. Takers lean slightly towards YES everywhere, whatever the answer turns out to be. Across all 686,272 trades, they were on the right side 50.2% of the time. A coin flip.

So the price doesn't get to the truth because the average trader is right. The average trader isn't. It gets there because some trades, at the right moment, carry real information, and they move the price more than the rest.

That's the same story as the earlier post, now with a clock on it. A few informed traders, paid by everyone else, drag the price toward the truth. This data shows when they do the dragging.

## Who knows what, and when

Hayek's man on the spot isn't one person. In this data there are at least two.

One knows something slow. What the Fed will do, built up over weeks. They show up early, trade big, and are roughly right, if a bit too keen.

The other knows something fast. Where the S&P is right now, with three hours to go. They show up late, in small trades, and they're the reason the last price is so good.

There's a third kind this data can't see: the insider, who knows something private and trades on it. I've argued before that they belong here too. Their knowledge goes into the price, and the market gets more complete. My line is simple. If you know because you did the work, trade. If you know because you control the outcome, don't.

The price only knows what the people trading it know, at the moment they trade. A day before a daily market closes, the knowledge mostly doesn't exist yet, so the price looks like a coin flip. That isn't the market failing. It's the market telling you, honestly, that nobody knows.

So when you look at a prediction market price, it's worth asking two things. How long until it closes? And has the knowledge that settles it been created yet?

If the answer is no, the price is a guess. A good guess, often. But it's the last hour that does the real work.

---

*Method and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Kalshi, December 2025.*
