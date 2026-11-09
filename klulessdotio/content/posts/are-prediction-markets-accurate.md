---
title: "The price is right. Who's doing the thinking?"
description: "Kalshi's final prices on economic markets land close to what happened, and a small group of traders does the work that makes them so."
short: "Kalshi's final prices land close to the truth, and a few traders doing the work are the reason."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 1
cover: chart-calibration.png
---

A prediction market price never sits still. It drifts, jumps, slides back. Seventy cents. Sixty-two. Seventy-eight. Then the result comes out and all of that collapses into one answer: yes or no.

It's a bit like superposition. Until the outcome lands, the price isn't a fact waiting to be revealed. It's the crowd's best guess, right now, and it keeps changing.

I wanted to see that guess forming. Not the final number. The trades underneath it, one by one, and how opinion took shape before the answer was known.

So I pulled every trade I could get from Kalshi.

## What I looked at

686,272 trades across 2,906 settled markets on Kalshi, the regulated US prediction market. The data is from December 2025.

I chose economic and financial markets on purpose: the Fed, CPI, the S&P 500, gas, oil, jobless claims. That's where I think prediction markets matter most, and I'll get to why. So this isn't a random sample of everything on Kalshi. It's the part I care about.

To score accuracy I used the Brier score. It's simple: take the price as a probability, compare it to what happened, and square the gap. 0 is perfect. 0.25 is what you'd get by saying 50/50 on everything, a coin flip.

## The final price is very good

Take the last trade before each market closed. The Brier score is **0.063**.

In the final hour it's **0.060**.

That's sharp. Professional forecasters would be happy with that.

![Kalshi prices against how often things happened](images/chart-calibration.png)

When the market said 80 cents, the thing happened about 84% of the time. When it said 50, about 50. The curve hugs the line.

## Except the longshots

At the cheap end, the curve lifts off the line.

Contracts in the 0 to 9 cent band happened 9.7% of the time. Across everything priced under 30 cents, the price said about 15% and reality said 21%.

Longshots won more often than their price said.

That's the opposite of the usual pattern. At the racetrack, longshots are overpriced because people love a long shot. Here they were underpriced. My guess is that in economic markets, people are quick to write off the surprising outcome. A Fed surprise, a hot CPI print. And the surprise shows up more often than they expect. (A caveat: I grouped prices into 10-cent bands, so treat these as rough.)

## Not every market can be sharp

The scores vary a lot by market.

![Brier score by market](images/chart-brier-by-market.png)

Daily index markets score close to a coin flip. That isn't the market failing. Nobody knows whether the S&P closes up tomorrow. A market can't be sharper than the thing is predictable.

Where real information exists and people work hard to find it, like the Fed, the price gets very good.

## So who's doing the thinking?

People call prediction markets information aggregators. Everyone brings what they know, the price adds it up, and out comes the truth.

That picture assumes people are thinking.

Some are. Some put in hours before they put in a dollar. And a lot of the time there's no thinking at all. A hunch, a team they like, a headline they half read.

It's player against player. Every dollar someone wins, someone else lost.

I looked at this on Polymarket, across about 248,000 traders. Profits are extremely concentrated. The Gini coefficient is **0.959**, where 0 means everyone makes the same and 1 means one person takes everything. Most countries sit around 0.3 to 0.4. The 1,000 most profitable traders, fewer than one in 200, took 62% of all the profits.

![The 1,000 most profitable Polymarket traders took 62% of the profits](images/chart-profit-share.png)

Two honest caveats. This is Polymarket, not Kalshi, and mostly politics and sports, so it's a different crowd from the calibration data above. And it's leaderboard data, which can miss people who lost everything and left. Concentrated profits also don't prove better thinking. Some of it is more money, faster bots, or people who know things early. So: thinking well, or at least trading well.

Here's the part I find interesting. This doesn't break the idea that markets aggregate information. It explains how it works.

The market never needed everyone to think. It needs a few people who do. They take money from the people who don't, and that's what drags the price toward the truth.

The noise traders pay for the accuracy.

## Why I don't think politics and sports are the best use

Most of the volume in prediction markets today is politics and sports.

Think about who has real money riding on a basketball game, outside the bet itself. Almost nobody. The only reason to trade is to bet.

Now think about CPI. Every business that buys inputs, sets prices, borrows, or pays wages has real exposure to inflation. A CPI market lets them hedge something they actually face. And when they trade, they bring real information with them: what they're seeing in their own costs.

That's a better market. Not because the people are smarter, but because they have a reason to be there other than gambling, and they know something.

## What better looks like

A yes/no contract gives you one number. "Will CPI be above 3%?" Sixty cents.

A market with ranges gives you the whole picture. CPI between 2.8 and 2.9, between 2.9 and 3.0, and so on, each with its own price. Same for a company's earnings: a range of EPS outcomes instead of a single beat-or-miss.

![A yes/no market next to a market with ranges](images/chart-yes-no-vs-ranges.png)

Once you have a spread like that, you can build on it. Spreads between ranges. Products that pay out like options. Things a hedger can actually use. A real-time CPI or PCE market, or ranged EPS markets, makes the whole market a better place to take part in.

This is what we're building at Truflation with Predict. *(I work at Truflation, so read this part with that in mind.)*

Predict only does economic markets. Markets made to price the things in the economy that don't have clarity yet.

Truflation invented real-time inflation. Now it's pricing it.

That's the part I care about most. Data on its own is useful. Data people can trade, hedge and build on is far more useful. Financialising the data is the point, and prediction markets are one way to do it.

Take earnings. On other platforms an EPS market asks one thing: will the company beat or miss? You get a yes or a no. You don't get a range, or a number an analyst or a trader can rely on. That's the gap we fill.

![An NVDA earnings market on Predict, priced as ranges](images/predict-nvda-eps-range.png)

*An earnings market on Predict. Five ranges, each with its own price, instead of beat or miss.*

![Truflation PCE on Predict](images/predict-truflation-pce.png)

*Truflation's real-time PCE, priced on Predict, with the market's forecast and its leading range.*

## Back to the superposition

Every price is a guess that hasn't collapsed yet.

On the economic markets I looked at, that guess turned out to be very good by the end. Better than I expected. But it was good because of a small number of people doing the work, and paid for by everyone who wasn't.

If that's how it works, then the question isn't whether prediction markets are accurate. It's what we point them at. Point them at things that matter to people's actual lives and businesses, and the people with real knowledge have a reason to show up.

---

*Method and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Kalshi and Polymarket, December 2025.*
