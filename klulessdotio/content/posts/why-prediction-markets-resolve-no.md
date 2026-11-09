---
title: "Why most prediction markets end in NO"
description: "Most prediction market contracts end in NO, mostly because of how the questions are written and not because the world is dull."
short: "72% of contracts resolve NO. That's mostly how the questions get written, not a boring world."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 2
---

There's a running joke among prediction market traders: nothing ever happens.

War is about to break out. Nothing happens. A CEO is about to resign. Nothing happens. A coin is about to hit a new high by Friday. Nothing happens.

So I counted. 161,638 contracts across Polymarket and Kalshi, every one of them settled.

72% resolved NO.

## My first thought: it's the design

When I saw 72%, my first thought wasn't that the world is boring. It was that this is how the markets are built.

If there are 10 markets on a topic, 9 of them will be NO.

Take The Open in 2025. Kalshi listed a contract for every golfer: "Will Scottie Scheffler win?", "Will Rory McIlroy win?", and so on. 229 of them.

![229 contracts for one golf tournament, one YES](images/neh-chart-the-open.png)

The event had a winner. Something definitely happened. But 228 of the 229 contracts resolved NO.

Now count the other way. Instead of contracts, count events: the tournament, the election, the CPI print. Did something happen?

![Counting contracts vs counting events](images/neh-chart-contracts-vs-events.png)

Read that again. Same data. Count contracts and nothing happens 72% of the time. Count events and something happens 73% of the time.

So 72% is, in a real sense, an arbitrary number. Change how you slice the questions and the number changes with it.

## The bigger data proves it

I went back and pulled Kalshi's full history: 1.77 million contracts.

Across all of them, the split is 50/50.

![NO rate by type of contract on Kalshi](images/neh-chart-by-type.png)

Ranges ("will CPI be between 2.9% and 3.0%?") resolve NO 93% of the time. Of course they do. Only one range can win. Thresholds ("will the S&P close above 6,000?") land near a coin flip, because Kalshi sets them up around where the price already is. Plain one-off events land at 74% NO.

Same platform. Same traders. Wildly different numbers. The shape of the question decides most of it.

## But design isn't the whole story

Even plain one-off questions, the kind that have nothing to do with ladders or brackets, still say NO three times out of four. So I went looking for what else pushes the number down. Here's what I found.

### 1. The clock runs out

Most one-off questions come with a deadline. "Will Coinbase begin publicly trading before January 1, 2021?"

That one resolved NO. Coinbase listed in April 2021.

It happened. It just happened late.

People are famously bad at this. In one classic study, students guessed they'd finish their thesis in about 34 days. It took them about 56. Psychologists call it the planning fallacy, and every "by this date" market is a bet against it.

The data has a nice fingerprint of this. YES contracts settle faster than NO ones.

![YES contracts settle faster than NO contracts](images/neh-chart-settle-speed.png)

When something happens, we know quickly. When nothing happens, we wait.

A YES ends the market the moment the thing happens, and it's news straight away. A NO isn't news until the deadline passes, so it sits there until then.

### 2. We only ask about change

Nobody lists a market for "Will things stay the same?"

Markets get made about the interesting possibility. The resignation, the war, the launch, the record high. And interesting usually means unlikely. If it were likely, it wouldn't be interesting.

So the questions themselves lean one way before anyone places a trade.

### 3. People pick exciting numbers. Machines don't.

Look at the gap between Kalshi's thresholds and its one-off events again. 52% YES against 26%.

Kalshi's threshold markets are set out in a ladder around today's price, so some rungs sit above and some below. A person writing a question by hand picks the number that's fun to talk about. Bitcoin to $150K. That number is usually a stretch.

### 4. The fine print favours NO

A YES needs the exact thing, in the exact way, confirmed by the exact source, before the exact time.

A NO needs anything else.

Half-finished deals, unofficial announcements, a day too late. They all count as NO.

### 5. Sometimes it runs the other way

Here's my favourite. If you ask "will the company beat analyst estimates?", the answer is YES about three times out of four. Over the last 10 years, around 75% of S&P 500 companies beat their earnings estimates.

Why? Companies guide expectations low so they can clear the bar.

That's the whole point in one example. The YES rate isn't telling you about the world. It's telling you about how the question was set. A beat-or-miss market on earnings has its answer baked in before it opens.

### 6. And when the world really changes, YES wins

My data had a small set of markets from 2020 and 2021, about COVID and the economy. Those resolved YES more often than not. Lockdowns happened. Inflation came in hot.

The samples are small, about 130 markets each, so I wouldn't lean on them. But it fits. Nothing ever happens, until it does.

## So should you just bet NO?

No. And this is the part that matters if you trade.

I checked whether winning traders lean NO. They don't. Winners and losers both buy YES about 51% of the time. YES positions actually won slightly more often than NO, 52% against 49%.

![Win rate of YES and NO positions](images/neh-chart-win-rates.png)

The price already knows. If a contract is 72% likely to resolve NO, it's priced that way, and you pay for it. I showed in an [earlier post](/writing/are-prediction-markets-accurate) that these prices are close to honest.

There's a hidden cost too. A NO bet usually has to wait for the deadline, so your money sits locked up longer. A YES that comes in frees it up days earlier, ready for the next trade.

What separates winners isn't the side they pick. It's the price they pay.

## What it actually means

Events happen all the time. Someone wins the tournament. Inflation prints a number. Coinbase lists, eventually.

What usually fails is the specific prediction. This person, this number, by this date.

"Nothing ever happens" isn't really about the world. It's about how we ask questions.

---

*Method and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Polymarket and Kalshi, December 2025.*
