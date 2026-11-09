---
title: "Which prediction markets work best?"
description: "Category doesn't change how a market works, it changes who turns up, and the Fed markets draw the crowd that makes prices sharp."
short: "Category doesn't change how a market works. It changes who turns up, and the Fed draws the right crowd."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 4
---

A market on a tennis match and a market on the Fed look like the same thing. Same yes or no. Same price in cents. Same button.

I wondered if they behave the same. Splitting by category makes the results easier to see, and it shows whether different categories get different results. So I split my data that way: sports, politics, crypto, finance, weather and the rest. Then I asked three questions. Which categories say YES most? Where does the money go? And where do the markets seem to work best?

Here's what I found.

## What I looked at

Two samples, both from December 2025.

On Polymarket, 72,717 settled yes/no contracts that carried a usable category tag. Polymarket's tags are loose and plenty of markets have none, so treat these categories as rough.

On Kalshi, 1,773,486 settled contracts from its financial and economic markets, 2022 to December 2025. Stock indexes, currencies, the Fed, CPI, oil, gas, Treasuries. Here I grouped markets by ticker, the short code Kalshi gives each series. KXFEDDECISION is the Fed's rate decision, for example. That's a cleaner label than a tag.

## Which categories say YES most

On Polymarket, finance markets resolved YES 39.5% of the time. Weather and local markets, 15.5%. Everything else landed in between.

![YES rate by category on Polymarket](images/cat-chart-yes-rates.png)

The research paper behind this post called finance "the only category where events happen more often than not." That's wrong, and I'm fixing it here. 39.5% is still less than half. No category gets to a coin flip.

So is finance just easier to say YES to? A little. Earnings "beat" markets lean YES, as I covered in [why most prediction markets end in NO](/writing/why-prediction-markets-resolve-no). But most of the gap comes from the shape of the questions each category tends to ask, which is the main point of that post.

Weather markets are often a ladder of temperature ranges for one city on one day. One range wins. Sports markets are often "will this team win the title?" One winner in a big field.

Kalshi shows the other side of this. Its tennis markets are single matches: two players, one winner. In a broader Kalshi sample of 63,116 contracts, they resolved YES 49.7% of the time, across 5,448 contracts. Polymarket's sports markets, full of tournament fields, came in at 25%.

Same kind of event. Different question. Different number.

So the YES rate by category mostly tells you how that category's questions get written. Not how often the world surprises us.

## Where the money goes

This is where categories really do differ.

On Polymarket, sports and politics took three quarters of the money in tagged markets: $10.4B and $9.2B out of $25.8B. Finance took 3%.

The more interesting part is the gap between how many markets a category has and how much money it pulls in.

![Share of contracts and share of volume by category on Polymarket](images/cat-chart-polymarket-money.png)

Politics is a tenth of the contracts and a third of the money. That's about $1.3M traded per contract. Crypto is the opposite: a quarter of the contracts and under a tenth of the money. My guess is that a lot of crypto markets are price ladders ("Will Bitcoin be above $X on Friday?") listed in bulk, and most rungs get little attention.

Kalshi's economic side has the same pattern, and it's sharper.

![Share of contracts and share of volume by market type on Kalshi](images/cat-chart-kalshi-money.png)

One note before the numbers. Kalshi counts volume in contracts, and each contract pays $1 if it wins. So the dollars that changed hands are lower than these figures. The comparisons still hold.

Kalshi listed 764,060 currency contracts. Almost all of them were hourly: will the euro be above some level at 3pm? They drew under 2% of the volume. The hourly euro contracts averaged about 7 contracts traded each.

Then the Fed. 110 contracts on the Fed's rate decisions drew 314 million contracts traded. That's 30% of everything in my Kalshi sample, about 2.9 million per contract.

Read that again. 110 contracts, out of 1.77 million, took almost a third of the trading.

The Fed isn't alone. 480 year-on-year CPI contracts drew about 52,000 each. Monthly gas price contracts, about 236,000 each.

So the number of markets doesn't tell you where people are. A machine can list a million contracts. People show up for a handful of questions they care about.

## Fast money looks bigger

One more thing hides inside volume. Some categories settle much faster than others.

In that broader Kalshi sample, sorted roughly by ticker, tennis matches settled in under a day at the median. Other sports took about three days. Finance took about ten. Politics took seven weeks.

Volume counts every trade. Money that settles on Tuesday can be bet again on Wednesday. So the same sports dollar can show up in the volume many times while a politics dollar waits for one answer. Some of sports' lead is the same money going round. That's my reasoning, not something I measured. It also makes politics' third of Polymarket's money more striking, since that money sat still for weeks.

## Where the markets work best

"Work" can mean two things. The price ends up close to the truth. And the people trading have a reason to be there, and something to bring.

You can't judge the first from a YES rate. The Kalshi paper read the 50/50 split on stock and currency threshold markets ("will the S&P close above X?") as proof they were "well-calibrated." It read the Fed's 81% NO rate as markets correctly predicting that the Fed would hold. Neither follows. A 50/50 split just means Kalshi drew its lines near the current price. Whether the prices were right is a separate question, and you answer it by comparing each price with what happened.

I did that in [an earlier post](/writing/are-prediction-markets-accurate), using the Brier score: square the gap between the price and the result, then average. 0 is perfect. 0.25 is a coin flip. Across all their trades, the Fed decision markets scored 0.084, one of the sharpest in the sample. The daily S&P 500 markets scored 0.20, not far off guessing. Nobody knows where the S&P closes tomorrow, and no market can fix that.

So the busiest question on Kalshi's economic side was also one of its sharpest. That's what you'd hope to see. Lots of people with real views, lots of trading, and a price that ends up close to right.

The second meaning is where I have a view. The money today follows entertainment. Sports and politics. Outside the bet, almost nobody has a stake in a tennis match. The only reason to trade it is to bet on it.

The Fed, CPI and earnings are different. Every business that borrows, sets prices or pays wages is exposed to them. When those people trade, they bring what they see in their own books. That's information a market can use, and a reason to be there that isn't the thrill.

I can't tell from this data who the Fed traders were. My read is that retail can trade these markets, so a lot of self-styled experts show up. Some of them really do know a lot. Some will be hedgers, and some will just like a big event. Whoever they were, on Kalshi's economic side that's where people showed up hardest, and that's where the price got sharpest.

Some markets are now built only around questions like these. [Predict by Truflation](https://predict.truflation.com) is one. It lists economic markets only, prices them as ranges rather than beat or miss, and settles them against independently verified data. *(I work at Truflation, so read this part with that in mind.)*

## One thing I can't explain

Kalshi's threshold markets are built to split about even, and for stocks and currencies they did: 48% NO. For rates and commodities, they resolved NO 97% of the time, across 1,413 rates contracts and 1,260 commodity contracts.

Something about where those lines were drawn didn't match how those prices moved. My guess is that most lines sat on one side while yields and oil drifted the other way. I don't have the data to check that yet.

## What I take from it

Category doesn't change how a prediction market works. It changes who turns up.

The YES rate by category is mostly about how the questions are written. The volume is mostly about entertainment. If you want to know which markets are worth listening to, look for questions people have a real stake in, then check whether the crowd came. On Kalshi, the Fed is that question.

---

*Method, full papers and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Polymarket and Kalshi, December 2025.*
