---
title: "Do the top traders know something, or are they just lucky?"
description: "The top 1,000 Polymarket traders took 62% of the profits, and the evidence points to a mix of knowledge, access and luck."
short: "The top 1,000 traders took 62% of the profits. Knowledge, access or luck, and usually some of each."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 7
---

A small number of people make most of the money in prediction markets. I'd seen it in my data before. So I asked myself the obvious question. What are the traders at the very top doing that everyone else isn't?

My own answer: either they have knowledge, or access to knowledge, that others don't. Or they're super lucky.

Those are three different things. Knowledge is someone who did the work. Access is someone who heard first. Luck is someone who happened to be standing in the right place. I went back to the data to see if it could tell them apart.

## What I looked at

About 248,000 Polymarket traders, from December 2025. Polymarket publishes leaderboards, ranked by profit and by volume, for the day, the week, the month and all time, in ten categories. I pulled every one. Volume is the total value of everything a trader bought and sold.

Two things to know about that list. Anyone who never ranked on any board isn't in it, and that's mostly small losers. And where a trader showed up on several boards, my code kept their best profit number. Both make the bottom of the list look better than it is. The profits also count open positions, so some will still change.

For 9,596 of the most profitable traders, I also tracked the money they deposited, on chain.

## The top takes almost everything

The middle trader on my list made $5.

The 1,000 biggest winners, less than half of one percent of the list, made $422 million between them. That's 62% of all the profit anyone made.

Losing is just as concentrated. The 1,000 biggest losers lost $249 million, 78% of all the losses.

![The 1,000 biggest winners took 62% of profits, and the 1,000 biggest losers took 78% of losses](images/tr-chart-both-ends.png)

The Gini coefficient for profits is 0.959. It measures inequality: 0 means everyone makes the same, 1 means one person takes everything. Most countries sit around 0.3 to 0.4.

## Where are the losers?

My paper said 71.9% of traders were profitable. I don't believe it, and the data says why.

Add up everyone on my list. The winners made $680 million. The losers lost $321 million.

![Traders on the list won $680 million and lost $321 million](images/tr-chart-missing-losers.png)

On Polymarket, every winning trade has someone on the other side. Across the whole crowd, wins and losses should come close to cancelling out. On my list, traders are $359 million up. That money came from somewhere, and mostly it came from people who aren't on the list. They lost, they never ranked, and they left.

So read every number in this post as "among people who made a leaderboard". The real crowd did worse.

## Is it size?

The first explanation I'd reach for is money. Big traders have more to bet, better tools, more time.

Size matters for how much you make. Among the 9,596 traders whose deposits I tracked, the ones who put in $100,000 or more supplied 94% of the money and took 76% of the profits. That sample is all winners, so it can't tell you who loses. It does say the big accounts made less on each dollar.

The volume leaderboard shows the rest. Take the 1,000 traders who moved the most money.

![Of the 1,000 biggest traders by volume, 463 were among the biggest winners and 112 among the biggest losers](images/tr-chart-whales.png)

463 of them were also among the 1,000 biggest winners. 112 were among the 1,000 biggest losers. The rest landed in between, and as a group they lost money, roughly $70 million.

Per dollar traded, the 1,000 biggest traders made about 0.75 cents. The 1,000 biggest winners made about 2.2 cents, on less volume. Size doesn't buy an edge. It makes whatever you have bigger, in either direction.

## The 62x that wasn't

My paper's headline was that small accounts did best. Traders who deposited under $1,000 averaged 62x their money. Whales averaged 1.15x.

That comparison doesn't hold, and I'm taking it back here. The 62x came from 147 traders I picked because they had turned under $1,000 into more than $5,000 of profit. They had made at least five times their money by definition. The whales came from a different list, the top traders by profit. Two groups picked two different ways can't tell you whether small beats big.

The small wins are real, but rare. Those 147 were 1.5% of a sample that was already all winners. The middle one made 28x. The biggest, on paper, made $100,550 from a $9 deposit, though I'm not sure my deposit tracking caught all of that account's money. Either way, that's a lottery ticket, not a strategy.

## Skill or luck?

Here's the hard part. Almost anything I can measure about the top traders is circular.

My paper found the top winners won 40% of their bets on outcomes priced under 30 cents, against 24% for the biggest losers. That sounds like skill. But I picked those groups by how much they made. Their long shots coming in is what made them winners. Any group chosen by profit will look skilled.

Concentration doesn't settle it either. The money at stake is just as lopsided: the top 1% of traders by volume moved 64% of all the money. When bet sizes are that uneven, even pure luck would hand most of the winnings to a few.

What can separate skill from luck is time. If winning were pure luck, a good month would say nothing about the next one. In [an earlier post](/writing/do-winning-traders-keep-winning) I found that it does. After a losing month, the next month made money 63% of the time. After three winning months in a row, 83%. The average month was 75%. Some traders are good, and they stay good. That sample is mostly winners, so I hold it loosely. But it's evidence against luck alone.

And the edge sits with a few. On Kalshi, [I found](/writing/how-prediction-market-prices-move) that the average trader who crossed the spread was right 50.2% of the time. A coin flip. Whatever knowledge reaches the price comes from a small number of people, and as I argued in [the calibration post](/writing/are-prediction-markets-accurate), everyone else pays for it.

Luck still does a lot of work at the very top. In the trader journey post, the middle profitable trader made 63% of their total profit in a single month. One trader on my list, Theo4, made $22 million, nearly all of it in the month of the 2024 US election. One election is one outcome. However good the reasoning, one call is one coin, and the result can't tell you whether it was a sure thing or a long shot that came in.

## Knowledge or access?

Say it isn't only luck. Is it knowledge, or access?

This data can't tell you. A leaderboard shows the result, not the reason. Someone who read every poll and someone who heard the answer early look exactly the same.

Sometimes the reason comes out anyway. Theo4, the $22 million trader, is the one the press called the "French whale". He told the Wall Street Journal that he commissioned his own polls through a major US pollster. They used the "neighbor effect": instead of asking people who they would vote for, they asked who they thought their neighbours would vote for. The results leaned to Trump. That's knowledge from doing the work, and nothing on a leaderboard would show it.

Access to knowledge also means knowing when the rules change. I learned that one myself. In its annual update, released on 30 September 2026, the Bureau of Economic Analysis changed how it measures some parts of the PCE price index: portfolio management and investment advice, legal services, computer software. My models had no history under the new method. It was one of the only times my forecast missed, by 0.1 points. What I lacked wasn't knowledge about the economy. It was knowledge about the measurement.

I'm not sure the difference between knowledge and access matters as much as people think. Someone who knows something others don't, and trades on it, puts that knowledge into the price. That's how the market gets smart. The line I'd draw is somewhere else. If you know because you did the work, trade. If you know because you control the outcome, don't. A leaderboard can't see that line.

To get closer, I'd need every trade with a timestamp, set against when the news came out. Did the winners move before the information was public, or after? That's the study I'd want to do next.

## What I take from it

The top of Polymarket isn't only a lottery. Good traders keep having good months, and the average trader really is guessing. But the biggest single fortunes came from one big call, and one big call is exactly where luck and skill look the same.

For my own CPI and PCE calls, I lean on my own forecasting models to help tell the work from the luck.

So my answer to my own question stands. Knowledge, access, or luck, and usually some of each. Size just turns the volume up.

---

*Method and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Polymarket, December 2025.*
